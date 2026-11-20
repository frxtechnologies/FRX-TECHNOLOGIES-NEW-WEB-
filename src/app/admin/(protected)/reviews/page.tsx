"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ReviewRow } from "@/lib/content/types";
import { revalidateSite } from "@/components/admin/media";

type Tab = "pending" | "approved" | "rejected";

/**
 * Review moderation. Visitors can only ever submit PENDING reviews (RLS column
 * grants); nothing appears on the site until it is approved here. Approve,
 * reject (hidden but kept), or delete permanently.
 */
export default function ReviewsAdminPage() {
  const supabase = useMemo(() => createClient() as unknown as SupabaseClient, []);
  const [tab, setTab] = useState<Tab>("pending");
  const [rows, setRows] = useState<ReviewRow[] | null>(null);
  const [counts, setCounts] = useState<Record<Tab, number>>({ pending: 0, approved: 0, rejected: 0 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ id: string; name: string; company: string; text: string } | null>(null);

  const saveEdit = async () => {
    if (!edit) return;
    if (edit.name.trim().length < 2 || edit.text.trim().length < 10) {
      return setError("A review needs a name (2+ characters) and text (10+ characters).");
    }
    setBusy(edit.id);
    const { error: err } = await supabase
      .from("reviews")
      .update({ name: edit.name.trim(), company: edit.company.trim(), text: edit.text.trim() })
      .eq("id", edit.id);
    setBusy(null);
    if (err) return setError(err.message);
    setEdit(null);
    setError("");
    await load();
    revalidateSite();
  };

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (err) {
      setError(
        err.code === "PGRST205" || /schema cache|does not exist/i.test(err.message)
          ? "The reviews table does not exist yet. Run supabase/migrations/20261120000100_frx_content.sql in the Supabase SQL editor, then reload."
          : err.message,
      );
      setRows([]);
      return;
    }
    setError("");
    const all = (data ?? []) as ReviewRow[];
    setRows(all);
    setCounts({
      pending: all.filter((r) => r.status === "pending").length,
      approved: all.filter((r) => r.status === "approved").length,
      rejected: all.filter((r) => r.status === "rejected").length,
    });
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (r: ReviewRow, status: Tab) => {
    setBusy(r.id);
    const { error: err } = await supabase
      .from("reviews")
      .update({ status, moderated_at: new Date().toISOString() })
      .eq("id", r.id);
    setBusy(null);
    if (err) return setError(err.message);
    await load();
    revalidateSite();
  };

  const remove = async (r: ReviewRow) => {
    if (!window.confirm(`Permanently delete the review from ${r.name}? This cannot be undone.`)) return;
    setBusy(r.id);
    const { error: err } = await supabase.from("reviews").delete().eq("id", r.id);
    setBusy(null);
    if (err) return setError(err.message);
    await load();
    revalidateSite();
  };

  const shown = rows?.filter((r) => r.status === tab) ?? [];

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Reviews</h1>
          <p className="rm-intro">
            Visitors submit reviews from the website. They stay hidden until you approve them.
          </p>
        </div>
      </header>

      <div className="rm-tabs" role="tablist" aria-label="Review status">
        {(["pending", "approved", "rejected"] as Tab[]).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className="rm-tab" onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)} <span>{counts[t]}</span>
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rm-banner">
          {error}
        </p>
      )}

      {rows === null ? (
        <p className="rm-intro">Loading…</p>
      ) : shown.length === 0 && !error ? (
        <div className="admin-card rm-empty">
          <p>No {tab} reviews.</p>
        </div>
      ) : (
        <ul className="rm-list">
          {shown.map((r) => (
            <li key={r.id} className="rm-review">
              <div className="rm-review-head">
                <span className="rm-stars" aria-label={`${r.rating} out of 5`}>
                  {"★".repeat(r.rating)}
                  <span>{"★".repeat(5 - r.rating)}</span>
                </span>
                <strong>{r.name}</strong>
                {r.company && <span className="rm-muted">· {r.company}</span>}
                <time className="rm-muted" dateTime={r.created_at}>
                  {new Date(r.created_at).toLocaleString()}
                </time>
              </div>
              {edit?.id === r.id ? (
                <div className="rm-edit">
                  <input aria-label="Reviewer name" value={edit.name} maxLength={80} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
                  <input aria-label="Company" value={edit.company} maxLength={80} placeholder="Company (optional)" onChange={(e) => setEdit({ ...edit, company: e.target.value })} />
                  <textarea aria-label="Review text" rows={4} value={edit.text} maxLength={800} onChange={(e) => setEdit({ ...edit, text: e.target.value })} />
                  <div className="rm-actions rm-actions--left">
                    <button type="button" className="rm-btn rm-btn--primary" disabled={busy === r.id} onClick={saveEdit}>
                      Save changes
                    </button>
                    <button type="button" className="rm-btn rm-btn--ghost" onClick={() => setEdit(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="rm-review-text">{r.text}</p>
              )}
              <div className="rm-actions rm-actions--left">
                {r.status !== "approved" && (
                  <button type="button" className="rm-btn rm-btn--primary" disabled={busy === r.id} onClick={() => setStatus(r, "approved")}>
                    Approve & publish
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button type="button" className="rm-btn rm-btn--ghost" disabled={busy === r.id} onClick={() => setStatus(r, "rejected")}>
                    {r.status === "approved" ? "Unpublish" : "Reject"}
                  </button>
                )}
                {r.status === "rejected" && (
                  <button type="button" className="rm-btn rm-btn--ghost" disabled={busy === r.id} onClick={() => setStatus(r, "pending")}>
                    Move back to pending
                  </button>
                )}
                <button type="button" className="rm-btn rm-btn--ghost" onClick={() => setEdit({ id: r.id, name: r.name, company: r.company, text: r.text })}>
                  Edit
                </button>
                <button type="button" className="rm-btn rm-btn--danger" disabled={busy === r.id} onClick={() => remove(r)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
