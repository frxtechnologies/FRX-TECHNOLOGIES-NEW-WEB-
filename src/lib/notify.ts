import "server-only";
import { ADMIN_EMAIL } from "@/lib/supabase/env";

/**
 * Owner notification by email (Resend), used when a visitor sends an enquiry.
 *
 * - Server-only: the API key is never `NEXT_PUBLIC_*` and never reaches the browser.
 * - Best-effort by design: the enquiry is already saved in Supabase before this runs,
 *   so a missing key or a Resend outage can never lose a lead. Failures are logged,
 *   never thrown, and never shown to the visitor.
 * - Replying from the inbox goes straight to the visitor (`reply_to` = their address).
 *
 * Env:
 *   RESEND_API_KEY          required to send anything
 *   RESEND_FROM_EMAIL       optional; defaults to Resend's shared sender, which can
 *                           only deliver to the email the Resend account was created
 *                           with — so create the account with the inbox below, or
 *                           verify your own domain and set this.
 *   ENQUIRY_NOTIFY_EMAIL    optional; defaults to the admin address
 */

const DEFAULT_FROM = "FRX Website <onboarding@resend.dev>";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Header values must be a single line.
const oneLine = (s: string, max = 120) => s.replace(/[\r\n]+/g, " ").trim().slice(0, max);

export type EnquiryMail = {
  name: string;
  email: string;
  company?: string | null;
  projectType: string;
  goal: string;
  message?: string | null;
};

export async function notifyNewEnquiry(e: EnquiryMail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[notify] RESEND_API_KEY is not set — enquiry saved, owner email not sent.");
    return;
  }
  const to = process.env.ENQUIRY_NOTIFY_EMAIL || ADMIN_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  const rows: [string, string][] = [
    ["Name", e.name],
    ["Email", e.email],
    ["Company", e.company || "—"],
    ["Project type", e.projectType],
    ["What they want to build", e.goal],
    ["More detail", e.message || "—"],
  ];
  const text =
    `New enquiry from the FRX Technologies website\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nReply to this email to answer ${e.name} directly.\nAll enquiries are also stored in /admin/inquiries.`;
  const html =
    `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;color:#0b1020">` +
    `<h2 style="margin:0 0 12px">New website enquiry</h2>` +
    `<table style="border-collapse:collapse;width:100%">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px 8px 0;vertical-align:top;color:#5b6475;white-space:nowrap">${esc(k)}</td>` +
          `<td style="padding:8px 0;white-space:pre-wrap">${esc(v)}</td></tr>`,
      )
      .join("") +
    `</table>` +
    `<p style="margin-top:18px;color:#5b6475;font-size:13px">Reply to this email to answer ${esc(e.name)} directly. ` +
    `Enquiries are also stored in the admin dashboard.</p></div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        reply_to: e.email,
        subject: oneLine(`New enquiry: ${e.projectType} — ${e.name}`),
        text,
        html,
      }),
    });
    if (!res.ok) console.error("[notify] Resend rejected the enquiry email:", res.status, await res.text().catch(() => ""));
  } catch (err) {
    console.error("[notify] could not reach Resend:", err instanceof Error ? err.message : err);
  }
}
