"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { submitInquiry } from "@/app/actions/public";
import { PROJECT_TYPES } from "@/lib/validation";
import type { Contact } from "@/lib/content/types";
import { LoopArrow, Squiggle } from "@/components/art/characters";

const waLink = (n: string) => `https://wa.me/${n.replace(/\D/g, "")}`;
const telLink = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

/**
 * Contact. Details on the left (email, phone, WhatsApp — all editable in
 * admin → Settings), a working enquiry form on the right. The form posts to the
 * existing `inquiries` table through a server action that validates, applies a
 * honeypot, a minimum fill time and a rate limit; the admin reads and replies
 * from /admin/inquiries as before. If saving fails the form never claims
 * success — it offers a prefilled email instead.
 */
export function ContactSection({ contact, asPage = false }: { contact: Contact; asPage?: boolean }) {
  const [f, setF] = useState({ name: "", email: "", company: "", projectType: "", goal: "", message: "" });
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [serverError, setServerError] = useState("");
  const meta = useRef({ token: "", start: 0 });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    meta.current = { token: crypto.randomUUID(), start: Date.now() };
  }, []);

  const set = (k: keyof typeof f) => (v: string) => {
    setF((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) er.email = "We need a valid email address to reply to.";
    if (f.goal.trim().length < 3) er.goal = "A sentence is enough — what are you trying to build?";
    if (!f.projectType) er.projectType = "Pick the closest match.";
    setErrors(er);
    const first = Object.keys(er)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const r = await submitInquiry({ ...f, trap, token: meta.current.token, elapsed: Date.now() - meta.current.start });
      if (r.ok) {
        setStatus("sent");
      } else {
        setErrors(r.fieldErrors ?? {});
        setServerError(r.error);
        setStatus("failed");
      }
    } catch {
      setServerError("We could not reach the server.");
      setStatus("failed");
    }
  };

  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(`Project enquiry — ${f.projectType || "FRX Technologies"}`)}&body=${encodeURIComponent(
    `Hi FRX,\n\n${f.goal}\n\n${f.message}\n\n— ${f.name}${f.company ? `, ${f.company}` : ""}`,
  )}`;

  const Heading = asPage ? "h1" : "h2";

  return (
    <section className="fxc" id="contact" aria-labelledby="fxc-title">
      <div className="fx-container fxc-wrap">
        <div className="fxc-left">
          <Heading id="fxc-title" className="fxc-h fx-d1 fx-up" data-fx="reveal-lines">
            Let&apos;s build something.
          </Heading>
          <Squiggle className="fxc-squig" />
          <p className="fx-lead fxc-lead" data-fx="fade-up">
            Tell us what you want to build. We reply by email to talk through the scope and what happens next.
          </p>

          <ul className="fxc-details" data-fx="fade-up">
            <li>
              <span className="fx-label">Email</span>
              <a className="fxc-link fx-h3" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </li>
            <li>
              <span className="fx-label">Phone</span>
              <a className="fxc-link fx-h3" href={telLink(contact.phone)}>
                {contact.phone}
              </a>
            </li>
            <li>
              <span className="fx-label">WhatsApp · Pakistan</span>
              <a className="fxc-link fx-h3" href={waLink(contact.whatsappNumber)} target="_blank" rel="noopener noreferrer">
                {contact.whatsappDisplay}
              </a>
            </li>
          </ul>
          <LoopArrow className="fxc-loop" />
        </div>

        <div className="fxc-panel">
          {status === "sent" ? (
            <div className="fxc-sent" role="status">
              <h3 className="fx-d3 fx-up">Message received.</h3>
              <p className="fx-body">
                Thank you{f.name.trim() ? `, ${f.name.trim().split(" ")[0]}` : ""}. We&apos;ll reply to {f.email.trim()} to talk
                through your project.
              </p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} noValidate className="fxc-form" aria-label="Project enquiry">
              <input type="text" name="fx_hp_check" id="fx_hp_check_c" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} className="fxr-trap" />

              <div className="fxc-two">
                <Field id="name" label="Name" value={f.name} onChange={set("name")} error={errors.name} autoComplete="name" required />
                <Field id="email" label="Email" type="email" value={f.email} onChange={set("email")} error={errors.email} autoComplete="email" required />
              </div>
              <div className="fxc-two">
                <Field id="company" label="Company" hint="optional" value={f.company} onChange={set("company")} autoComplete="organization" />
                <div className="fxr-f">
                  <label htmlFor="fxc-projectType">
                    What do you need? <b aria-hidden="true">*</b>
                  </label>
                  <select
                    id="fxc-projectType"
                    name="projectType"
                    value={f.projectType}
                    onChange={(e) => set("projectType")(e.target.value)}
                    aria-invalid={!!errors.projectType}
                    aria-describedby={errors.projectType ? "fxc-projectType-err" : undefined}
                  >
                    <option value="">Choose one…</option>
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.projectType && (
                    <p id="fxc-projectType-err" role="alert" className="fxr-err">
                      {errors.projectType}
                    </p>
                  )}
                </div>
              </div>
              <Field id="goal" label="What are you trying to build?" value={f.goal} onChange={set("goal")} error={errors.goal} required />
              <div className="fxr-f">
                <label htmlFor="fxc-message">
                  More detail <span>(optional)</span>
                </label>
                <textarea id="fxc-message" name="message" rows={4} maxLength={4000} value={f.message} onChange={(e) => set("message")(e.target.value)} />
              </div>

              {status === "failed" && (
                <p role="alert" className="fxr-fail">
                  {serverError || "We could not send that."} You can{" "}
                  <a href={mailto} className="fxc-link-inline">
                    email us directly instead
                  </a>
                  .
                </p>
              )}

              <div className="fxr-actions">
                <p className="fx-small fx-muted">We only use your details to reply to this enquiry.</p>
                <button type="submit" className="fx-btn" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send enquiry"}
                  <span className="fx-shift" aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  required,
  hint,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <div className="fxr-f">
      <label htmlFor={`fxc-${id}`}>
        {label} {required && <b aria-hidden="true">*</b>}
        {hint && <span>({hint})</span>}
      </label>
      <input
        id={`fxc-${id}`}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `fxc-${id}-err` : undefined}
        required={required}
      />
      {error && (
        <p id={`fxc-${id}-err`} role="alert" className="fxr-err">
          {error}
        </p>
      )}
    </div>
  );
}
