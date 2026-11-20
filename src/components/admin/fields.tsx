"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { previewUrl, uploadMedia } from "./media";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "image" | "images" | "boolean" | "number" | "lines" | "select";
  required?: boolean;
  hint?: string;
  placeholder?: string;
  max?: number;
  rows?: number;
  options?: readonly string[];
  /** Value used when creating a new record (defaults to empty / false / 0). */
  default?: unknown;
  /** Storage folder inside the `media` bucket for image fields. */
  folder?: string;
};

export type Values = Record<string, unknown>;

/** Initial value for a field when creating a new record. */
export function emptyFor(f: FieldDef): unknown {
  if (f.default !== undefined) return f.default;
  switch (f.type) {
    case "boolean":
      return false;
    case "number":
      return 0;
    case "images":
    case "lines":
      return [];
    case "select":
      return f.options?.[0] ?? "";
    default:
      return "";
  }
}

export function validateValues(fields: FieldDef[], v: Values): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const val = v[f.name];
    if (f.required) {
      const blank = val == null || (typeof val === "string" && !val.trim()) || (Array.isArray(val) && !val.length);
      if (blank) errors[f.name] = `${f.label} is required.`;
    }
    if (typeof val === "string") {
      if (f.max && val.length > f.max) errors[f.name] = `${f.label} must be ${f.max} characters or fewer.`;
      if (f.type === "url" && val.trim() && !/^https?:\/\/\S+$/i.test(val.trim())) {
        errors[f.name] = "Enter a full address starting with https://";
      }
    }
  }
  return errors;
}

/** Normalise a values object for the database (trim strings, nulls for empty optional text/url). */
export function toRow(fields: FieldDef[], v: Values): Values {
  const out: Values = {};
  for (const f of fields) {
    const val = v[f.name];
    if (typeof val === "string") {
      const t = val.trim();
      out[f.name] = (f.type === "url" || f.type === "image") && !t ? null : f.type === "textarea" ? val.trim() : t;
    } else {
      out[f.name] = val;
    }
  }
  return out;
}

function ImageField({
  f,
  value,
  onChange,
  supabase,
  multiple,
}: {
  f: FieldDef;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  supabase: SupabaseClient;
  multiple: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const list = multiple ? (value as string[]) : value ? [value as string] : [];

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    try {
      const paths: string[] = [];
      for (const file of Array.from(files)) paths.push(await uploadMedia(supabase, file, f.folder ?? "misc"));
      onChange(multiple ? [...list, ...paths] : paths[0]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="rm-img">
      {list.length > 0 && (
        <ul className="rm-thumbs">
          {list.map((p) => {
            const url = previewUrl(p);
            return (
              <li key={p} className="rm-thumb">
                {url ? <Image src={url} alt="" width={120} height={90} unoptimized /> : <span>no preview</span>}
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => onChange(multiple ? list.filter((x) => x !== p) : "")}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <label className="rm-drop">
        <input ref={input} type="file" accept="image/*" multiple={multiple} onChange={(e) => pick(e.target.files)} disabled={busy} />
        {busy ? "Uploading…" : list.length ? (multiple ? "Add more images" : "Replace image") : "Choose an image"}
      </label>
      {err && (
        <p role="alert" className="rm-err">
          {err}
        </p>
      )}
    </div>
  );
}

export function FieldInput({
  f,
  values,
  setValue,
  error,
  supabase,
}: {
  f: FieldDef;
  values: Values;
  setValue: (name: string, v: unknown) => void;
  error?: string;
  supabase: SupabaseClient;
}) {
  const id = `rm-${f.name}`;
  const v = values[f.name];
  const common = {
    id,
    name: f.name,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-err` : undefined,
  };

  let control: React.ReactNode;
  switch (f.type) {
    case "textarea":
      control = (
        <textarea {...common} rows={f.rows ?? 4} maxLength={f.max} value={(v as string) ?? ""} placeholder={f.placeholder} onChange={(e) => setValue(f.name, e.target.value)} />
      );
      break;
    case "lines":
      control = (
        <textarea
          {...common}
          rows={f.rows ?? 5}
          value={Array.isArray(v) ? (v as string[]).join("\n") : ""}
          placeholder={f.placeholder ?? "One item per line"}
          onChange={(e) => setValue(f.name, e.target.value.split("\n"))}
          onBlur={(e) => setValue(f.name, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
        />
      );
      break;
    case "boolean":
      control = (
        <label className="rm-check">
          <input type="checkbox" {...common} checked={!!v} onChange={(e) => setValue(f.name, e.target.checked)} />
          <span>{f.hint ?? "Yes"}</span>
        </label>
      );
      break;
    case "number":
      control = <input {...common} type="number" value={(v as number) ?? 0} onChange={(e) => setValue(f.name, Number(e.target.value))} />;
      break;
    case "select":
      control = (
        <select {...common} value={(v as string) ?? ""} onChange={(e) => setValue(f.name, e.target.value)}>
          {f.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
      break;
    case "image":
    case "images":
      control = (
        <ImageField f={f} value={(v as string | string[]) ?? (f.type === "images" ? [] : "")} multiple={f.type === "images"} supabase={supabase} onChange={(nv) => setValue(f.name, nv)} />
      );
      break;
    default:
      control = (
        <input {...common} type={f.type === "url" ? "url" : "text"} maxLength={f.max} value={(v as string) ?? ""} placeholder={f.placeholder} onChange={(e) => setValue(f.name, e.target.value)} />
      );
  }

  return (
    <div className="rm-field">
      <label htmlFor={id}>
        {f.label} {f.required && <b aria-hidden="true">*</b>}
      </label>
      {control}
      {f.hint && f.type !== "boolean" && <p className="rm-hint">{f.hint}</p>}
      {f.max && (f.type === "text" || f.type === "textarea") && typeof v === "string" ? (
        <p className="rm-hint">
          {v.length}/{f.max}
        </p>
      ) : null}
      {error && (
        <p id={`${id}-err`} role="alert" className="rm-err">
          {error}
        </p>
      )}
    </div>
  );
}
