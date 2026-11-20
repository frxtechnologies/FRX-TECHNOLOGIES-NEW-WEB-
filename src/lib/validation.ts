import { z } from "zod";

/** Strip control characters, collapse runs of spaces, trim. Newlines survive only when `multiline`. */
export const clean = (v: unknown, multiline = false) => {
  if (typeof v !== "string") return v;
  const noCtl = v.replace(
    multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g,
    "",
  );
  const spaced = noCtl.replace(/[ \t]+/g, " ");
  return (multiline ? spaced.replace(/\n{3,}/g, "\n\n") : spaced).trim();
};
const single = (schema: z.ZodString) => z.preprocess((v) => clean(v), schema);
const multi = (schema: z.ZodString) => z.preprocess((v) => clean(v, true), schema);

/**
 * Bot checks shared by every public form:
 *  - `trap`    an invisible honeypot field that humans never fill
 *  - `elapsed` milliseconds between the form mounting and submitting (≥ 2s)
 *  - `token`   a per-form-session UUID so a retry can never create a duplicate
 */
const guards = {
  trap: z.string().max(0),
  elapsed: z.number().min(2000),
  token: z.uuid(),
};

export const reviewSchema = z.object({
  name: single(z.string().min(2, "Please enter your name.").max(80, "Please keep your name under 80 characters.")),
  company: single(z.string().max(80, "Please keep the company name under 80 characters.")),
  rating: z.number().int().min(1, "Please choose a star rating.").max(5),
  text: multi(
    z
      .string()
      .min(10, "Please write at least 10 characters.")
      .max(800, "Please keep your review under 800 characters."),
  ),
  ...guards,
});
export type ReviewInput = z.input<typeof reviewSchema>;

export const PROJECT_TYPES = [
  "Custom software",
  "Web application / SaaS",
  "Website or e-commerce",
  "Mobile app",
  "AI automation",
  "AI assistant / chatbot",
  "CRM / business system",
  "UI/UX design",
  "Data & analytics",
  "Something else",
] as const;

export const inquirySchema = z.object({
  name: single(z.string().min(2, "Please tell us your name.").max(100)),
  email: single(
    z
      .string()
      .max(160)
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "That doesn't look like a valid email address."),
  ),
  company: single(z.string().max(120)),
  goal: single(z.string().min(3, "A sentence is enough — what are you trying to build?").max(300)),
  projectType: single(z.string().min(1, "Pick the closest match.").max(80)),
  message: multi(z.string().max(4000)),
  ...guards,
});
export type InquiryInput = z.input<typeof inquirySchema>;

export type FormResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
