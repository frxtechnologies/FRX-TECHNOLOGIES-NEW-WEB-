"use server";

import { createClient } from "@supabase/supabase-js";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import {
  fieldErrorsOf,
  inquirySchema,
  reviewSchema,
  type FormResult,
  type InquiryInput,
  type ReviewInput,
} from "@/lib/validation";

/**
 * PUBLIC form actions. They run as the anonymous role: Row Level Security and
 * column grants let `anon` only INSERT a *pending* review or a new inquiry —
 * never read, change or publish anything. Layers, in order:
 *   honeypot + fill time → per-visitor rate limit → server-side validation →
 *   database constraints → database flood guard.
 * A tripped honeypot or a too-fast submission looks like success to the bot.
 */

function anon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

type DbError = { code?: string; message?: string } | null;
function dbFailure(e: DbError): FormResult {
  if (e?.code === "23505") return { ok: true }; // same token → the first submission already succeeded
  if (e?.message?.includes("Too many submissions")) {
    return { ok: false, error: "We are receiving a lot of submissions right now. Please try again in a little while." };
  }
  console.error("[public form] insert failed:", e?.code, e?.message);
  return { ok: false, error: "We could not save that just now. Please try again in a moment." };
}

export async function submitReview(input: ReviewInput): Promise<FormResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((i) => i.path[0]);
    if (keys.includes("trap") || keys.includes("elapsed")) return { ok: true };
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const sb = anon();
  if (!sb) return { ok: false, error: "Reviews are not available right now. Please try again later." };
  if (!rateLimit(`review:${await clientKey()}`, 4, 60 * 60_000)) {
    return { ok: false, error: "You have sent several reviews recently. Please try again later." };
  }

  const { name, company, rating, text, token } = parsed.data;
  // status is not sent: the column grant forbids it and the default is 'pending'.
  const { error } = await sb.from("reviews").insert({ name, company, rating, text, client_token: token });
  if (error?.code === "PGRST205") {
    // The reviews table has not been created yet (migration not run).
    return { ok: false, error: "Reviews are not available right now. Please try again later." };
  }
  return error ? dbFailure(error) : { ok: true };
}

/** Project enquiry → the existing `inquiries` table (read and replied to in /admin/inquiries). */
export async function submitInquiry(input: InquiryInput): Promise<FormResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((i) => i.path[0]);
    if (keys.includes("trap") || keys.includes("elapsed")) return { ok: true };
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const sb = anon();
  if (!sb) return { ok: false, error: "The form is not available right now. Please email us directly." };
  if (!rateLimit(`inquiry:${await clientKey()}`, 5, 60 * 60_000)) {
    return { ok: false, error: "You have sent several enquiries recently. Please try again later or contact us directly." };
  }

  const { name, email, company, goal, projectType, message } = parsed.data;
  const { error } = await sb.from("inquiries").insert({
    name,
    email,
    company: company || null,
    goal,
    project_type: projectType,
    message: message || null,
  });
  return error ? dbFailure(error) : { ok: true };
}
