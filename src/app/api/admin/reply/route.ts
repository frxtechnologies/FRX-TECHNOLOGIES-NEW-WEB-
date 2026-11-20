import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { ADMIN_EMAIL, isAdminEmail } from "@/lib/supabase/env";

/**
 * Sends the admin's reply to an inquiry by email and records it on the row.
 *
 * Two env vars gate real sending: RESEND_API_KEY and RESEND_FROM_EMAIL.
 * Neither is `NEXT_PUBLIC_*` — this route runs server-side only, so the key
 * never reaches the browser. Without both set, this returns `unconfigured`
 * rather than pretending the email went out; the admin UI falls back to a
 * prefilled mailto, the same honest-fallback pattern the public contact form
 * already uses when no backend is wired up.
 *
 * Auth is checked here independently of RLS: RLS would stop this route from
 * *recording* the reply against a row it doesn't own, but Resend has no idea
 * about Supabase policies, so the email-send step itself needs its own gate.
 */
export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  let body: { inquiryId?: string; to?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const { inquiryId, to, subject, message } = body;
  if (!inquiryId || !to || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return NextResponse.json({ ok: false, reason: "unconfigured" });
  }

  const sendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text: message,
      reply_to: ADMIN_EMAIL,
    }),
  });

  if (!sendRes.ok) {
    const detail = await sendRes.text().catch(() => "");
    console.error("Resend send failed:", sendRes.status, detail);
    return NextResponse.json({ ok: false, reason: "send_failed" }, { status: 502 });
  }

  // Recorded via the cookie-backed client, so this write runs as the signed-in
  // admin and goes through the same RLS policy as every other admin edit —
  // no special-cased server privilege for this one route.
  const { error: updateError } = await supabase
    .from("inquiries")
    .update({
      replied_at: new Date().toISOString(),
      reply_subject: subject,
      reply_message: message,
    })
    .eq("id", inquiryId);

  if (updateError) {
    console.error("Failed to record reply:", updateError.message);
    // The email genuinely sent — tell the truth about that even though the
    // record-keeping half failed.
    return NextResponse.json({ ok: true, recorded: false });
  }

  return NextResponse.json({ ok: true, recorded: true });
}
