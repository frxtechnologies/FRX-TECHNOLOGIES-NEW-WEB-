import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * Ask FRX → the FRX "Website Chat" scenario on Make.
 *
 * The browser only ever talks to this route. The Make webhook address is a server-side
 * secret (`ASSISTANT_WEBHOOK_URL`, never NEXT_PUBLIC_*): anyone holding it could call the
 * scenario directly and spend its AI credits. Layers here, in order:
 *   same-site check → per-visitor rate limit → input limits → upstream call with a timeout.
 *
 * Make receives { message, history } where `history` is the conversation so far as plain
 * text ("Visitor: …" / "Assistant: …"); it replies with the answer as plain text.
 * The answer is treated as untrusted data: control characters are stripped, the length is
 * capped, and the client renders it as text (never as HTML).
 *
 * The visitor's message is deliberately NOT logged here — only outcomes.
 */

export const maxDuration = 30;

type Turn = { role: "user" | "frx"; text: string };
type Fail = "unconfigured" | "bad_request" | "forbidden" | "rate" | "unavailable";

const fail = (reason: Fail, status: number) => NextResponse.json({ ok: false, reason }, { status });

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/[ \t]+/g, " ").trim().slice(0, max) : "";

/**
 * The webhook address from the environment, forgiving about how it was pasted into the
 * hosting dashboard: surrounding quotes/spaces are dropped, a bare Make hook ID
 * ("abc123…") becomes https://hook.eu1.make.com/abc123…, and a missing "https://" is added.
 * Returns null when it is empty or still not a usable address (the widget then falls back
 * to its authored answers instead of showing a chat that cannot work).
 */
function webhookUrl(): string | null {
  let v = (process.env.ASSISTANT_WEBHOOK_URL ?? "").trim().replace(/^["']+|["']+$/g, "").trim();
  if (!v) return null;
  if (/^[a-z0-9]{20,64}$/i.test(v)) v = `https://hook.eu1.make.com/${v}`;
  else if (v.startsWith("//")) v = `https:${v}`;
  else if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    console.error("[assistant] ASSISTANT_WEBHOOK_URL is set but is not a valid web address.");
    return null;
  }
}

/** Cheap capability probe so the widget knows whether to show the AI chat or the authored answers. */
export async function GET() {
  return NextResponse.json({ enabled: !!webhookUrl() });
}

export async function POST(request: Request) {
  const url = webhookUrl();
  if (!url) return fail("unconfigured", 503);

  // Browsers always send Origin on cross-site POSTs; refuse anything not from this site.
  const origin = request.headers.get("origin");
  if (origin) {
    let ok = false;
    try {
      ok = new URL(origin).host === request.headers.get("host");
    } catch {}
    if (!ok) return fail("forbidden", 403);
  }

  if (!rateLimit(`assistant:${await clientKey()}`, 24, 10 * 60_000)) return fail("rate", 429);

  let body: { message?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("bad_request", 400);
  }

  const message = clean(body.message, 500);
  if (message.length < 1) return fail("bad_request", 400);

  const turns: Turn[] = Array.isArray(body.history)
    ? (body.history as unknown[])
        .slice(-10)
        .map((t) => {
          const o = t as { role?: unknown; text?: unknown };
          return { role: o?.role === "frx" ? ("frx" as const) : ("user" as const), text: clean(o?.text, 800) };
        })
        .filter((t) => t.text)
    : [];
  const history = turns.map((t) => `${t.role === "frx" ? "Assistant" : "Visitor"}: ${t.text}`).join("\n");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
    const raw = res.ok ? await res.text() : "";
    const answer = clean(raw, 2000);
    // Make answers "Accepted" when the scenario ended without reaching its response module.
    if (!res.ok || !answer || /^accepted$/i.test(answer)) {
      console.error("[assistant] upstream gave no usable answer, status", res.status);
      return fail("unavailable", 502);
    }
    return NextResponse.json({ ok: true, answer });
  } catch (e) {
    console.error("[assistant] upstream failed:", e instanceof Error ? e.name : "error");
    return fail("unavailable", 502);
  }
}
