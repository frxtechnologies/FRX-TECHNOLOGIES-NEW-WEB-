"use client";

import { useRef, useState } from "react";
import { ActionButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const PROJECT_TYPES = [
  "Website",
  "Web Application",
  "AI Automation",
  "AI Assistant / Chatbot",
  "Custom Software",
  "UI/UX",
  "Other",
] as const;

type Fields = {
  name: string;
  email: string;
  company: string;
  goal: string;
  projectType: string;
  message: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = {
  name: "",
  email: "",
  company: "",
  goal: "",
  projectType: "",
  message: "",
};

/**
 * Project enquiry form.
 *
 * Submits straight to the `inquiries` table in Supabase — RLS allows anyone
 * to insert but only the admin account to read, so this write is safe with
 * nothing but the public anon key in the browser. If Supabase isn't
 * configured for this deployment, or the insert fails for any reason, the
 * form does NOT claim success: it falls back to a prefilled mailto rather
 * than showing "message received" over one that went nowhere.
 */
async function submitEnquiry(fields: Fields): Promise<{ ok: boolean }> {
  let supabase;
  try {
    supabase = createClient();
  } catch {
    return { ok: false };
  }

  const { error } = await supabase.from("inquiries").insert({
    name: fields.name.trim(),
    email: fields.email.trim(),
    company: fields.company.trim() || null,
    goal: fields.goal.trim(),
    project_type: fields.projectType,
    message: fields.message.trim() || null,
  });

  return { ok: !error };
}

function validate(fields: Fields): Errors {
  const errors: Errors = {};

  if (!fields.name.trim()) errors.name = "Please tell us your name.";

  if (!fields.email.trim()) {
    errors.email = "We need an email address to reply to.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
    errors.email = "That doesn't look like a valid email address.";
  }

  if (!fields.goal.trim()) {
    errors.goal = "A sentence is enough — what are you trying to build?";
  }

  if (!fields.projectType) errors.projectType = "Pick the closest match.";

  return errors;
}

export function ProjectForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "unconfigured">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const set = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    // Clear a field's error as soon as the visitor starts fixing it, rather
    // than making them submit again to find out.
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found = validate(fields);
    if (Object.keys(found).length) {
      setErrors(found);
      const firstKey = Object.keys(found)[0];
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstKey}"]`)
        ?.focus();
      return;
    }

    setState("sending");
    const { ok } = await submitEnquiry(fields);
    setState(ok ? "sent" : "unconfigured");
  };

  if (state === "sent") {
    return <SuccessPanel name={fields.name} />;
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="frx-form">
      <div className="frx-form-grid">
        <Field
          label="Name"
          name="name"
          value={fields.name}
          onChange={set("name")}
          error={errors.name}
          autoComplete="name"
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={fields.email}
          onChange={set("email")}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Field
          label="Company"
          name="company"
          value={fields.company}
          onChange={set("company")}
          hint="Optional"
          autoComplete="organization"
        />
        <Field
          label="What do you want to build?"
          name="goal"
          value={fields.goal}
          onChange={set("goal")}
          error={errors.goal}
          required
        />
      </div>

      <fieldset className="frx-fieldset">
        <legend className="frx-label">
          Project type <span className="frx-required">*</span>
        </legend>
        <div className="frx-choices">
          {PROJECT_TYPES.map((type) => (
            <label key={type} className="frx-choice">
              <input
                type="radio"
                name="projectType"
                value={type}
                checked={fields.projectType === type}
                onChange={() => set("projectType")(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
        {errors.projectType && (
          <p className="frx-error" role="alert">
            {errors.projectType}
          </p>
        )}
      </fieldset>

      <Field
        label="Anything else"
        name="message"
        value={fields.message}
        onChange={set("message")}
        hint="Optional — requirements, timing, constraints, what you've already tried"
        textarea
      />

      {state === "unconfigured" && <UnconfiguredNotice fields={fields} />}

      <div className="flex flex-wrap items-center gap-4">
        <ActionButton type="submit" className="text-step-md">
          {state === "sending" ? "Checking…" : "Send enquiry"}
        </ActionButton>
        <p className="text-step-xs text-[var(--text-faint)]">
          We only ask for what we need to reply.
        </p>
      </div>
    </form>
  );
}

/**
 * Shown when no endpoint is configured. This is the honest path: the visitor is
 * told the form isn't wired up and given a working alternative, instead of a
 * success animation over a message that was never delivered.
 */
function UnconfiguredNotice({ fields }: { fields: Fields }) {
  const subject = encodeURIComponent(
    `Project enquiry — ${fields.projectType || "General"}`,
  );
  const body = encodeURIComponent(
    [
      `Name: ${fields.name}`,
      `Email: ${fields.email}`,
      fields.company && `Company: ${fields.company}`,
      `Project type: ${fields.projectType}`,
      "",
      `What they want to build: ${fields.goal}`,
      fields.message && "",
      fields.message && fields.message,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return (
    <div className="frx-notice" role="status">
      <p className="frx-notice-title">This form isn&apos;t connected yet.</p>
      <p>
        Submissions have nowhere to go until a delivery endpoint is configured, so
        we&apos;d rather not pretend yours was received. Your answers are ready to send
        by email instead — one click, nothing retyped.
      </p>
      <a className="frx-notice-action" href={`mailto:?subject=${subject}&body=${body}`}>
        Open in email
      </a>
    </div>
  );
}

function SuccessPanel({ name }: { name: string }) {
  return (
    <div className="frx-success" role="status">
      <span className="frx-success-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M4 12.5l5.2 5.2L20 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
      </span>
      <h2 className="t-h3 max-w-[16ch]">
        Thanks{name ? `, ${name.split(" ")[0]}` : ""}. That&apos;s with us.
      </h2>
      <p className="max-w-[44ch] text-step-md leading-relaxed text-[var(--text-muted)]">
        We read every enquiry ourselves. You&apos;ll hear back with an actual response to
        what you wrote, not an autoresponder.
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  type = "text",
  textarea,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  autoComplete?: string;
}) {
  const id = `f-${name}`;
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="frx-field" data-invalid={Boolean(error)} data-wide={textarea}>
      <label className="frx-label" htmlFor={id}>
        {label} {required && <span className="frx-required">*</span>}
      </label>

      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className="frx-input"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          autoComplete={autoComplete}
          className="frx-input"
        />
      )}

      <span className="frx-field-rule" aria-hidden="true" />

      {hint && !error && (
        <p id={`${id}-hint`} className="frx-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="frx-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
