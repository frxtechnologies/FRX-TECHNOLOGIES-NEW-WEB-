"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/components/admin/media";
import {
  DEFAULT_THEME_SETTINGS,
  PALETTES,
  contrast,
  sanitizeSubAccent,
  type ThemeSettings,
} from "@/lib/theme-config";

/**
 * Admin → Theme. Controls what a NEW visitor sees: the default palette and mode,
 * which palettes may be offered, whether visitors may switch at all, and an
 * optional secondary-accent override (validated: it must be a real, readable
 * accent — never near-white, near-black or grey). A visitor who already chose a
 * look keeps it unless switching is disabled here.
 */
export default function ThemeAdminPage() {
  const supabase = useMemo(() => createClient() as unknown as SupabaseClient, []);
  const [s, setS] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [state, setState] = useState<"loading" | "idle" | "saving">("loading");
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "theme").maybeSingle();
      if (error && (error.code === "PGRST205" || /schema cache|does not exist/i.test(error.message))) {
        setMsg({ tone: "error", text: "Settings storage does not exist yet. Run the content migration in the Supabase SQL editor, then reload." });
      } else if (error) setMsg({ tone: "error", text: error.message });
      else if (data?.value) setS({ ...DEFAULT_THEME_SETTINGS, ...(data.value as Partial<ThemeSettings>) });
      setState("idle");
    })();
  }, [supabase]);

  const enabled = s.enabledPalettes.split(",").filter(Boolean);
  const toggleEnabled = (id: string) => {
    const next = enabled.includes(id) ? enabled.filter((x) => x !== id) : [...enabled, id];
    if (!next.length) return;
    setS((v) => ({
      ...v,
      enabledPalettes: next.join(","),
      defaultPalette: next.includes(v.defaultPalette) ? v.defaultPalette : next[0],
    }));
  };

  const accentCheck = sanitizeSubAccent(s.subAccent);
  const accentRatio = /^#[0-9a-f]{6}$/i.test(s.subAccent) ? contrast(s.subAccent, previewMode === "light" ? "#f4f2ed" : "#0a0b0e") : null;

  const save = async () => {
    if (!accentCheck.ok) return setMsg({ tone: "error", text: accentCheck.reason ?? "Invalid accent colour." });
    setState("saving");
    const { error } = await supabase.from("site_settings").upsert({ key: "theme", value: s, updated_at: new Date().toISOString() });
    setState("idle");
    if (error) return setMsg({ tone: "error", text: error.message });
    setMsg({ tone: "ok", text: "Published. New visitors will see this default; the site is refreshing." });
    revalidateSite();
  };

  const restore = async () => {
    if (!window.confirm("Restore the original FRX theme? This removes your theme settings.")) return;
    const { error } = await supabase.from("site_settings").delete().eq("key", "theme");
    if (error) return setMsg({ tone: "error", text: error.message });
    setS(DEFAULT_THEME_SETTINGS);
    setMsg({ tone: "ok", text: "Restored the original FRX theme." });
    revalidateSite();
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Theme</h1>
          <p className="rm-intro">
            Four colour identities of the same FRX brand, each in light and dark. Choose what new visitors see first and
            what they are allowed to change.
          </p>
        </div>
      </header>

      <div className="admin-card rm-set">
        <div className="rm-field">
          <span className="rm-lbl">Default appearance for new visitors</span>
          <div className="rm-seg" role="group" aria-label="Default mode">
            {(["light", "dark"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={s.defaultMode === m} onClick={() => setS({ ...s, defaultMode: m })}>
                {m === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </div>

        <div className="rm-field">
          <span className="rm-lbl">Palettes</span>
          <p className="rm-hint">Select the default and choose which palettes visitors can pick from.</p>
          <div className="rm-pal">
            {PALETTES.map((p) => {
              const on = enabled.includes(p.id);
              return (
                <div key={p.id} className="rm-palcard" data-default={s.defaultPalette === p.id}>
                  <div className="rm-pv-row">
                    {(["light", "dark"] as const).map((m) => (
                      <div key={m} className="fx-root rm-pv" data-pv={`${p.id}-${m}`}>
                        <span className="rm-pv-big">BUILD.</span>
                        <span className="rm-pv-chips">
                          <i className="rm-pv-btn">Start</i>
                          <i className="rm-pv-sub" />
                          <i className="rm-pv-tint" />
                        </span>
                        <span className="rm-pv-cap">{m}</span>
                      </div>
                    ))}
                  </div>
                  <strong>{p.name}</strong>
                  <small>{p.blurb}</small>
                  <label className="rm-check">
                    <input type="checkbox" checked={on} onChange={() => toggleEnabled(p.id)} />
                    <span>Offer to visitors</span>
                  </label>
                  <label className="rm-check">
                    <input
                      type="radio"
                      name="default-palette"
                      checked={s.defaultPalette === p.id}
                      disabled={!on}
                      onChange={() => setS({ ...s, defaultPalette: p.id })}
                    />
                    <span>Default</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rm-field">
          <label className="rm-check">
            <input
              type="checkbox"
              checked={s.allowVisitorSwitch !== "false"}
              onChange={(e) => setS({ ...s, allowVisitorSwitch: e.target.checked ? "true" : "false" })}
            />
            <span>Let visitors switch theme and light/dark (the switcher is hidden when off)</span>
          </label>
        </div>

        <div className="rm-field">
          <label htmlFor="sub-accent">Secondary accent override (optional)</label>
          <div className="rm-color">
            <input
              type="color"
              aria-label="Pick secondary accent"
              value={/^#[0-9a-f]{6}$/i.test(s.subAccent) ? s.subAccent : "#ff6a13"}
              onChange={(e) => setS({ ...s, subAccent: e.target.value })}
            />
            <input
              id="sub-accent"
              type="text"
              placeholder="#rrggbb — leave empty to use each palette's own accent"
              value={s.subAccent}
              onChange={(e) => setS({ ...s, subAccent: e.target.value.trim() })}
              aria-invalid={!accentCheck.ok}
            />
            {s.subAccent && (
              <button type="button" className="rm-btn rm-btn--ghost" onClick={() => setS({ ...s, subAccent: "" })}>
                Clear
              </button>
            )}
          </div>
          {!accentCheck.ok ? (
            <p role="alert" className="rm-err">
              {accentCheck.reason}
            </p>
          ) : (
            <p className="rm-hint">
              FRX blue stays the primary colour. This replaces the secondary accent in every palette within safe limits (a
              saturated, mid-tone colour); text colours are adjusted automatically to stay readable
              {accentRatio ? ` — as a fill it measures ${accentRatio.toFixed(1)}:1 against the ${previewMode} ground` : ""}.
            </p>
          )}
        </div>

        <div className="rm-actions">
          <button type="button" className="rm-btn rm-btn--ghost" onClick={restore} disabled={state !== "idle"}>
            Restore original FRX theme
          </button>
          <button type="button" className="rm-btn rm-btn--primary" onClick={save} disabled={state !== "idle"}>
            {state === "saving" ? "Publishing…" : "Save & publish"}
          </button>
        </div>
        {msg && (
          <p role={msg.tone === "error" ? "alert" : "status"} className={msg.tone === "error" ? "rm-banner" : "rm-ok"}>
            {msg.text}
          </p>
        )}
      </div>
    </>
  );
}
