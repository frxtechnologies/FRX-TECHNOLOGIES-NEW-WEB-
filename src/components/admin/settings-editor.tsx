"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { FieldInput, validateValues, type FieldDef, type Values } from "./fields";
import { revalidateSite } from "./media";

export type SettingsBlock = {
  key: string;
  title: string;
  intro?: string;
  fields: FieldDef[];
  defaults: Record<string, string>;
};

/**
 * Edits one `site_settings` row (hero, about, contact, social, footer…). The
 * form is pre-filled from the stored value merged over the built-in defaults,
 * so the admin always sees exactly what the site is showing. "Reset" deletes
 * the stored override and the site goes back to the built-in text.
 */
export function SettingsEditor({ block }: { block: SettingsBlock }) {
  const supabase = useMemo(() => createClient() as unknown as SupabaseClient, []);
  const [values, setValues] = useState<Values>(block.defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"loading" | "idle" | "saving">("loading");
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", block.key).maybeSingle();
      if (error && (error.code === "PGRST205" || /schema cache|does not exist/i.test(error.message))) {
        setMsg({
          tone: "error",
          text: "Settings storage does not exist yet. Run supabase/migrations/20261120000100_frx_content.sql in the Supabase SQL editor, then reload.",
        });
      } else if (error) {
        setMsg({ tone: "error", text: error.message });
      } else if (data?.value && typeof data.value === "object") {
        setValues({ ...block.defaults, ...(data.value as Record<string, string>) });
      }
      setState("idle");
    })();
  }, [supabase, block]);

  const save = async () => {
    const found = validateValues(block.fields, values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setState("saving");
    const value = Object.fromEntries(block.fields.map((f) => [f.name, String(values[f.name] ?? "").trim()]));
    const { error } = await supabase.from("site_settings").upsert({ key: block.key, value, updated_at: new Date().toISOString() });
    setState("idle");
    if (error) return setMsg({ tone: "error", text: error.message });
    setMsg({ tone: "ok", text: "Saved. The website is updating." });
    revalidateSite();
  };

  const reset = async () => {
    if (!window.confirm("Reset this section to the built-in text? Your edits will be removed.")) return;
    const { error } = await supabase.from("site_settings").delete().eq("key", block.key);
    if (error) return setMsg({ tone: "error", text: error.message });
    setValues(block.defaults);
    setMsg({ tone: "ok", text: "Reset to the built-in text." });
    revalidateSite();
  };

  return (
    <form
      className="admin-card rm-set"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <h2>{block.title}</h2>
      {block.intro && <p className="rm-intro">{block.intro}</p>}
      {block.fields.map((f) => (
        <FieldInput
          key={f.name}
          f={f}
          values={values}
          setValue={(name, v) => {
            setValues((s) => ({ ...s, [name]: v }));
            if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
          }}
          error={errors[f.name]}
          supabase={supabase}
        />
      ))}
      <div className="rm-actions">
        <button type="button" className="rm-btn rm-btn--ghost" onClick={reset} disabled={state !== "idle"}>
          Reset to defaults
        </button>
        <button type="submit" className="rm-btn rm-btn--primary" disabled={state !== "idle"}>
          {state === "saving" ? "Saving…" : "Save changes"}
        </button>
      </div>
      {msg && (
        <p role={msg.tone === "error" ? "alert" : "status"} className={msg.tone === "error" ? "rm-banner" : "rm-ok"}>
          {msg.text}
        </p>
      )}
    </form>
  );
}
