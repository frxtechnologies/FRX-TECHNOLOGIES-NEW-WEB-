"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { FieldInput, emptyFor, toRow, validateValues, type FieldDef, type Values } from "./fields";
import { previewUrl, revalidateSite } from "./media";

type Row = Values & { id: string; position: number; published?: boolean };

export type ResourceConfig = {
  table: string;
  title: string;
  intro: string;
  singular: string;
  fields: FieldDef[];
  /** Field shown as the row's title / subtitle / thumbnail. */
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  /** Does the table have a `published` column? */
  hasPublished?: boolean;
  /** Initial rows offered by the "Load defaults" button when the table is empty. */
  seed?: Values[];
  seedLabel?: string;
  emptyText: string;
};

type Toast = { tone: "ok" | "error"; text: string } | null;

/**
 * One admin editor for every ordered collection (projects, technologies,
 * testimonials, FAQs, affiliations, service overrides). It talks to Supabase
 * with the signed-in admin's session — Row Level Security, not this UI, is what
 * keeps anyone else out — and refreshes the public site after each save.
 */
export function ResourceManager({ config }: { config: ResourceConfig }) {
  const supabase = useMemo(() => createClient() as unknown as SupabaseClient, []);
  const { table, fields, titleField, subtitleField, imageField } = config;

  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<{ id: string | null; values: Values } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const say = (tone: "ok" | "error", text: string) => {
    setToast({ tone, text });
    window.setTimeout(() => setToast(null), 4200);
  };

  const load = useCallback(async () => {
    const { data, error } = await supabase.from(table).select("*").order("position", { ascending: true });
    if (error) {
      setLoadError(
        error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message)
          ? "This table does not exist yet. Run supabase/migrations/20261120000100_frx_content.sql in the Supabase SQL editor, then reload."
          : error.message,
      );
      setRows([]);
      return;
    }
    setLoadError("");
    setRows((data ?? []) as Row[]);
  }, [supabase, table]);

  useEffect(() => {
    load();
  }, [load]);

  const blank = (): Values => Object.fromEntries(fields.map((f) => [f.name, emptyFor(f)]));

  const startNew = () => {
    setErrors({});
    setEditing({ id: null, values: { ...blank(), ...(config.hasPublished ? {} : {}) } });
  };
  const startEdit = (r: Row) => {
    setErrors({});
    setEditing({ id: r.id, values: Object.fromEntries(fields.map((f) => [f.name, r[f.name] ?? emptyFor(f)])) });
  };

  const save = async () => {
    if (!editing) return;
    const found = validateValues(fields, editing.values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`rm-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSaving(true);
    const payload = toRow(fields, editing.values);
    const res = editing.id
      ? await supabase.from(table).update(payload).eq("id", editing.id)
      : await supabase.from(table).insert({ ...payload, position: (rows?.at(-1)?.position ?? -1) + 1 });
    setSaving(false);
    if (res.error) {
      say("error", /duplicate key/i.test(res.error.message) ? "That entry already exists." : res.error.message);
      return;
    }
    say("ok", editing.id ? "Saved." : `${config.singular} added.`);
    setEditing(null);
    await load();
    revalidateSite();
  };

  const remove = async (r: Row) => {
    if (!window.confirm(`Delete “${String(r[titleField] ?? "this item")}”? This cannot be undone.`)) return;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) return say("error", error.message);
    say("ok", "Deleted.");
    await load();
    revalidateSite();
  };

  const togglePublished = async (r: Row) => {
    const { error } = await supabase.from(table).update({ published: !r.published }).eq("id", r.id);
    if (error) return say("error", error.message);
    setRows((rs) => rs?.map((x) => (x.id === r.id ? { ...x, published: !r.published } : x)) ?? null);
    revalidateSite();
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!rows) return;
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const a = rows[index];
    const b = rows[j];
    // Swap positions; if they happen to be equal, spread them first.
    const pa = a.position === b.position ? j : b.position;
    const pb = a.position === b.position ? index : a.position;
    const [r1, r2] = await Promise.all([
      supabase.from(table).update({ position: pa }).eq("id", a.id),
      supabase.from(table).update({ position: pb }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) return say("error", (r1.error ?? r2.error)!.message);
    await load();
    revalidateSite();
  };

  const loadDefaults = async () => {
    if (!config.seed?.length) return;
    const { error } = await supabase.from(table).insert(config.seed.map((s, i) => ({ ...s, position: i })));
    if (error) return say("error", error.message);
    say("ok", "Defaults loaded — edit or remove anything you like.");
    await load();
    revalidateSite();
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="admin-title">{config.title}</h1>
          <p className="rm-intro">{config.intro}</p>
        </div>
        {!loadError && (
          <button type="button" className="rm-btn rm-btn--primary" onClick={startNew}>
            + Add {config.singular.toLowerCase()}
          </button>
        )}
      </header>

      {loadError && (
        <p role="alert" className="rm-banner">
          {loadError}
        </p>
      )}

      {rows === null ? (
        <p className="rm-intro">Loading…</p>
      ) : rows.length === 0 && !loadError ? (
        <div className="admin-card rm-empty">
          <p>{config.emptyText}</p>
          {config.seed?.length ? (
            <button type="button" className="rm-btn" onClick={loadDefaults}>
              {config.seedLabel ?? "Load defaults"}
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="rm-list">
          {rows.map((r, i) => {
            const img = imageField ? previewUrl(r[imageField] as string | null) : null;
            return (
              <li key={r.id} className="rm-row" data-off={config.hasPublished && !r.published}>
                <div className="rm-order">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                    ↑
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down">
                    ↓
                  </button>
                </div>
                {imageField && (
                  <div className="rm-pic">{img ? <Image src={img} alt="" width={96} height={72} unoptimized /> : <span>—</span>}</div>
                )}
                <button type="button" className="rm-main" onClick={() => startEdit(r)}>
                  <strong>{String(r[titleField] ?? "Untitled")}</strong>
                  {subtitleField && r[subtitleField] ? <span>{String(r[subtitleField]).slice(0, 110)}</span> : null}
                </button>
                {config.hasPublished && (
                  <label className="rm-pub">
                    <input type="checkbox" checked={!!r.published} onChange={() => togglePublished(r)} />
                    <span>{r.published ? "Published" : "Hidden"}</span>
                  </label>
                )}
                <button type="button" className="rm-btn rm-btn--ghost" onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button type="button" className="rm-btn rm-btn--danger" onClick={() => remove(r)} aria-label={`Delete ${String(r[titleField] ?? "")}`}>
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <div className="rm-modal" role="dialog" aria-modal="true" aria-label={editing.id ? `Edit ${config.singular}` : `New ${config.singular}`}>
          <div className="rm-modal-bg" onClick={() => !saving && setEditing(null)} />
          <form
            className="rm-panel"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <h2>{editing.id ? `Edit ${config.singular.toLowerCase()}` : `New ${config.singular.toLowerCase()}`}</h2>
            {fields.map((f) => (
              <FieldInput
                key={f.name}
                f={f}
                values={editing.values}
                setValue={(name, v) => {
                  setEditing((s) => (s ? { ...s, values: { ...s.values, [name]: v } } : s));
                  if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
                }}
                error={errors[f.name]}
                supabase={supabase}
              />
            ))}
            <div className="rm-actions">
              <button type="button" className="rm-btn rm-btn--ghost" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="rm-btn rm-btn--primary" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <p className="admin-toast" data-tone={toast.tone === "error" ? "error" : undefined} role="status">
          {toast.text}
        </p>
      )}
    </>
  );
}
