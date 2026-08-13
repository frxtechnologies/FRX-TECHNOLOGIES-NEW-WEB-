"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AssistantAction, AssistantEntryRow } from "@/lib/supabase/types";
import { ActionButton } from "@/components/ui/button";

const BLANK: Omit<AssistantEntryRow, "id" | "created_at" | "updated_at" | "position"> = {
  question: "",
  chip: "",
  answer: "",
  actions: [],
  published: true,
};

/**
 * Controls what the public Quick Assistant can say. Every question and
 * answer a visitor can pick from is authored here — there is no path from
 * this table to a language model, so nothing added here can hallucinate a
 * capability or a price; it can only say whatever is typed into the Answer
 * field below.
 */
export default function AssistantAdminPage() {
  const [rows, setRows] = useState<AssistantEntryRow[] | null>(null);
  const [editing, setEditing] = useState<AssistantEntryRow | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const load = async () => {
    const { data, error: err } = await supabase
      .from("assistant_entries")
      .select("*")
      .order("position", { ascending: true });
    if (err) {
      setError(err.message);
      return;
    }
    setRows(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = async (row: AssistantEntryRow, dir: -1 | 1) => {
    if (!rows) return;
    const idx = rows.findIndex((r) => r.id === row.id);
    const swapWith = rows[idx + dir];
    if (!swapWith) return;

    const next = [...rows];
    next[idx] = { ...row, position: swapWith.position };
    next[idx + dir] = { ...swapWith, position: row.position };
    next.sort((a, b) => a.position - b.position);
    setRows(next);

    await Promise.all([
      supabase.from("assistant_entries").update({ position: swapWith.position }).eq("id", row.id),
      supabase.from("assistant_entries").update({ position: row.position }).eq("id", swapWith.id),
    ]);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this question? It will disappear from the assistant immediately.")) return;
    setRows((rs) => rs?.filter((r) => r.id !== id) ?? null);
    const { error: err } = await supabase.from("assistant_entries").delete().eq("id", id);
    if (err) setError(err.message);
  };

  const togglePublished = async (row: AssistantEntryRow) => {
    setRows((rs) => rs?.map((r) => (r.id === row.id ? { ...r, published: !r.published } : r)) ?? null);
    await supabase
      .from("assistant_entries")
      .update({ published: !row.published })
      .eq("id", row.id);
  };

  return (
    <>
      <header className="admin-header">
        <h1 className="admin-title">Quick Assistant</h1>
        <ActionButton type="button" onClick={() => setEditing("new")}>
          Add question
        </ActionButton>
      </header>

      {error && (
        <p className="frx-error mb-4" role="alert">
          {error}
        </p>
      )}

      {rows === null ? (
        <p className="admin-empty">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="admin-empty">No questions yet. Add the first one.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <li key={row.id} className="admin-card flex items-start gap-4">
              <div className="flex flex-col gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => move(row, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="admin-icon-btn"
                  style={{ opacity: i === 0 ? 0.3 : 1 }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(row, 1)}
                  disabled={i === rows.length - 1}
                  aria-label="Move down"
                  className="admin-icon-btn"
                  style={{ opacity: i === rows.length - 1 ? 0.3 : 1 }}
                >
                  ↓
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-step-sm font-medium">{row.question}</p>
                  {!row.published && (
                    <span className="admin-pill" data-status="archived">
                      hidden
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-step-xs text-[var(--text-muted)]">{row.answer}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePublished(row)}
                  className="frx-textlink text-step-xs"
                >
                  {row.published ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(row)}
                  className="frx-textlink text-step-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  aria-label={`Delete "${row.question}"`}
                  className="admin-icon-btn"
                  data-danger="true"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                    <path
                      d="M3 4h10M6.5 4V2.6h3V4M4.5 4l.6 9.4h5.8L11.5 4"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <EntryDrawer
          entry={editing === "new" ? null : editing}
          nextPosition={rows?.length ?? 0}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}

function EntryDrawer({
  entry,
  nextPosition,
  onClose,
  onSaved,
}: {
  entry: AssistantEntryRow | null;
  nextPosition: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(entry ?? { ...BLANK, position: nextPosition });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setAction = (i: number, patch: Partial<AssistantAction>) => {
    setForm((f) => ({
      ...f,
      actions: f.actions.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    }));
  };

  const addAction = () => {
    if (form.actions.length >= 3) return;
    setForm((f) => ({
      ...f,
      actions: [...f.actions, { kind: "route", label: "", href: "" }],
    }));
  };

  const removeAction = (i: number) => {
    setForm((f) => ({ ...f, actions: f.actions.filter((_, idx) => idx !== i) }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.chip.trim() || !form.answer.trim()) {
      setError("Question, chip label and answer are all required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      question: form.question.trim(),
      chip: form.chip.trim(),
      answer: form.answer.trim(),
      actions: form.actions.filter((a) => a.label.trim() && a.href.trim()),
      published: form.published,
      position: form.position,
    };

    const { error: err } = entry
      ? await supabase.from("assistant_entries").update(payload).eq("id", entry.id)
      : await supabase.from("assistant_entries").insert(payload);

    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={entry ? "Edit question" : "Add question"}
      onClick={onClose}
    >
      <form
        onSubmit={save}
        className="flex h-full w-full max-w-lg flex-col gap-5 overflow-y-auto border-l border-[var(--border)] bg-[var(--bg)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-step-lg font-medium">{entry ? "Edit question" : "New question"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="admin-icon-btn">
            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        <div className="frx-field">
          <label className="frx-label" htmlFor="question">
            Question
          </label>
          <input
            id="question"
            className="frx-input"
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            placeholder="What does FRX Technologies do?"
          />
          <span className="frx-field-rule" aria-hidden="true" />
        </div>

        <div className="frx-field">
          <label className="frx-label" htmlFor="chip">
            Chip label
          </label>
          <input
            id="chip"
            className="frx-input"
            value={form.chip}
            onChange={(e) => setForm((f) => ({ ...f, chip: e.target.value }))}
            placeholder="Short version shown as the button"
          />
          <span className="frx-field-rule" aria-hidden="true" />
        </div>

        <div className="frx-field">
          <label className="frx-label" htmlFor="answer">
            Answer
          </label>
          <textarea
            id="answer"
            rows={5}
            className="frx-input"
            value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
          />
          <span className="frx-field-rule" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="t-eyebrow">Buttons under the answer</span>
            {form.actions.length < 3 && (
              <button type="button" onClick={addAction} className="frx-textlink text-step-xs">
                + Add
              </button>
            )}
          </div>

          {form.actions.map((a, i) => (
            <div key={i} className="admin-card flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <select
                  value={a.kind}
                  onChange={(e) => setAction(i, { kind: e.target.value as AssistantAction["kind"] })}
                  className="frx-input"
                  style={{ width: "auto" }}
                >
                  <option value="route">Internal page</option>
                  <option value="link">External link</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeAction(i)}
                  className="frx-textlink text-step-xs"
                  style={{ color: "#e5484d" }}
                >
                  Remove
                </button>
              </div>
              <input
                className="frx-input"
                placeholder="Label, e.g. Start a Project"
                value={a.label}
                onChange={(e) => setAction(i, { label: e.target.value })}
              />
              <input
                className="frx-input"
                placeholder={a.kind === "route" ? "/contact" : "https://…"}
                value={a.href}
                onChange={(e) => setAction(i, { href: e.target.value })}
              />
            </div>
          ))}
        </div>

        <label className="frx-choice" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            style={{ position: "static", opacity: 1, width: "auto", height: "auto" }}
          />
          <span style={{ border: "none", padding: 0 }}>Visible on the site</span>
        </label>

        {error && (
          <p className="frx-error" role="alert">
            {error}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 border-t border-[var(--border)] pt-5">
          <ActionButton type="submit">{saving ? "Saving…" : "Save"}</ActionButton>
        </div>
      </form>
    </div>
  );
}
