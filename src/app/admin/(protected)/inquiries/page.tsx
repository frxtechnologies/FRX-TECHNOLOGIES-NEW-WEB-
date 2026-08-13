"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Inquiry, InquiryStatus } from "@/lib/supabase/types";

const TABS: { key: InquiryStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "archived", label: "Archived" },
];

/**
 * Client-rendered rather than server-fetched: every action here (status
 * change, delete, reply) is a mutation, and a page that already needs a
 * Supabase client for writes may as well use it for the initial read too,
 * instead of splitting the same data access across a server fetch and a
 * client mutation path that have to be kept in sync by hand.
 */
export default function InquiriesPage() {
  const [rows, setRows] = useState<Inquiry[] | null>(null);
  const [tab, setTab] = useState<InquiryStatus | "all">("all");
  const [active, setActive] = useState<Inquiry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const load = async () => {
    const { data, error: err } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
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

  const filtered = rows?.filter((r) => tab === "all" || r.status === tab) ?? [];

  const setStatus = async (id: string, status: InquiryStatus) => {
    setRows((rs) => rs?.map((r) => (r.id === id ? { ...r, status } : r)) ?? null);
    if (active?.id === id) setActive((a) => (a ? { ...a, status } : a));
    const { error: err } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (err) setError(err.message);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this inquiry? This can't be undone.")) return;
    setRows((rs) => rs?.filter((r) => r.id !== id) ?? null);
    setActive((a) => (a?.id === id ? null : a));
    const { error: err } = await supabase.from("inquiries").delete().eq("id", id);
    if (err) setError(err.message);
  };

  const open = (row: Inquiry) => {
    setActive(row);
    if (row.status === "new") setStatus(row.id, "read");
  };

  const applyReplied = (id: string, patch: Partial<Inquiry>) => {
    setRows((rs) => rs?.map((r) => (r.id === id ? { ...r, ...patch } : r)) ?? null);
    setActive((a) => (a?.id === id ? { ...a, ...patch } : a));
  };

  return (
    <>
      <header className="admin-header">
        <h1 className="admin-title">Inquiries</h1>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="admin-nav-link"
              data-active={tab === t.key}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <p className="frx-error mb-4" role="alert">
          {error}
        </p>
      )}

      {rows === null ? (
        <p className="admin-empty">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="admin-empty">Nothing here.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Received</th>
                <th>Replied</th>
                <th aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} data-clickable="true" onClick={() => open(r)}>
                  <td>
                    <span className="admin-pill" data-status={r.status}>
                      {r.status}
                    </span>
                  </td>
                  <td>{r.name}</td>
                  <td className="text-[var(--text-muted)]">{r.email}</td>
                  <td>{r.project_type}</td>
                  <td className="text-[var(--text-faint)]">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="text-[var(--text-faint)]">
                    {r.replied_at ? new Date(r.replied_at).toLocaleDateString() : "—"}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      aria-label={`Delete inquiry from ${r.name}`}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active && (
        <InquiryDrawer
          inquiry={active}
          onClose={() => setActive(null)}
          onStatus={(s) => setStatus(active.id, s)}
          onDelete={() => remove(active.id)}
          onReplied={(patch) => applyReplied(active.id, patch)}
        />
      )}
    </>
  );
}

function InquiryDrawer({
  inquiry,
  onClose,
  onStatus,
  onDelete,
  onReplied,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onStatus: (s: InquiryStatus) => void;
  onDelete: () => void;
  onReplied: (patch: Partial<Inquiry>) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={`Inquiry from ${inquiry.name}`}
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col gap-5 overflow-y-auto border-l border-[var(--border)] bg-[var(--bg)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-step-lg font-medium">{inquiry.name}</h2>
            <a href={`mailto:${inquiry.email}`} className="frx-textlink text-step-xs">
              {inquiry.email}
            </a>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="admin-icon-btn">
            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>

        <dl className="flex flex-col gap-3 text-step-xs">
          <Row label="Project type" value={inquiry.project_type} />
          {inquiry.company && <Row label="Company" value={inquiry.company} />}
          <Row label="Received" value={new Date(inquiry.created_at).toLocaleString()} />
        </dl>

        <div>
          <p className="t-eyebrow mb-2">What they want to build</p>
          <p className="text-step-sm leading-relaxed">{inquiry.goal}</p>
        </div>

        {inquiry.message && (
          <div>
            <p className="t-eyebrow mb-2">Message</p>
            <p className="text-step-sm leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
          </div>
        )}

        <ReplyPanel inquiry={inquiry} onReplied={onReplied} />

        <div className="mt-auto flex flex-col gap-3 border-t border-[var(--border)] pt-5">
          <div className="flex items-center gap-2">
            <span className="t-eyebrow">Status</span>
            <div className="flex gap-1">
              {(["new", "read", "archived"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStatus(s)}
                  className="admin-pill"
                  data-status={s}
                  style={{
                    opacity: inquiry.status === s ? 1 : 0.45,
                    border: "1px solid transparent",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onDelete}
            className="frx-textlink self-start text-step-xs"
            style={{ color: "#e5484d" }}
          >
            Delete inquiry
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Composes and sends the reply.
 *
 * Real sending goes through /api/admin/reply, which only works once
 * RESEND_API_KEY and RESEND_FROM_EMAIL are set on the server. Until then the
 * route reports itself as `unconfigured` and this falls back to a prefilled
 * mailto — same honest-fallback shape as the public contact form, so the
 * admin never sees a fake "sent" confirmation for an email that didn't go
 * anywhere.
 */
function ReplyPanel({
  inquiry,
  onReplied,
}: {
  inquiry: Inquiry;
  onReplied: (patch: Partial<Inquiry>) => void;
}) {
  const [subject, setSubject] = useState(
    inquiry.reply_subject ?? `Re: your project enquiry — FRX Technologies`,
  );
  const [message, setMessage] = useState(inquiry.reply_message ?? "");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error" | "info"; text: string } | null>(
    null,
  );

  const mailtoFallback = () => {
    const href = `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(href, "_blank");
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId: inquiry.id, to: inquiry.email, subject, message }),
      });
      const data = await res.json();

      if (data.reason === "unconfigured") {
        setNotice({
          tone: "info",
          text: "Email sending isn't connected yet — opening your email client with this reply prefilled instead.",
        });
        mailtoFallback();
      } else if (data.ok) {
        setNotice({ tone: "ok", text: "Reply sent." });
        onReplied({
          replied_at: new Date().toISOString(),
          reply_subject: subject,
          reply_message: message,
        });
      } else {
        setNotice({ tone: "error", text: "Couldn't send that reply. Try again in a moment." });
      }
    } catch {
      setNotice({ tone: "error", text: "Couldn't reach the server. Check your connection." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="t-eyebrow">Reply</p>
        {inquiry.replied_at && (
          <span className="text-[0.7rem] text-[var(--text-faint)]">
            Last sent {new Date(inquiry.replied_at).toLocaleString()}
          </span>
        )}
      </div>

      <form onSubmit={send} className="flex flex-col gap-3">
        <div className="frx-field">
          <label className="frx-label" htmlFor="reply-subject">
            Subject
          </label>
          <input
            id="reply-subject"
            className="frx-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <span className="frx-field-rule" aria-hidden="true" />
        </div>

        <div className="frx-field">
          <label className="frx-label" htmlFor="reply-message">
            Message
          </label>
          <textarea
            id="reply-message"
            rows={5}
            className="frx-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${inquiry.name.split(" ")[0]},`}
          />
          <span className="frx-field-rule" aria-hidden="true" />
        </div>

        {notice && (
          <p
            role="status"
            className="text-step-xs"
            style={{
              color:
                notice.tone === "error"
                  ? "#e5484d"
                  : notice.tone === "ok"
                    ? "var(--accent-text)"
                    : "var(--text-faint)",
            }}
          >
            {notice.text}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={sending || !subject.trim() || !message.trim()}
            className="frx-btn"
            data-variant="primary"
            style={{
              background: "var(--frx-blue)",
              color: "#fff",
              opacity: sending ? 0.7 : 1,
            }}
          >
            <span className="frx-btn-label relative z-10 px-[1.2em] py-[0.6em] text-step-xs leading-none">
              {sending ? "Sending…" : "Send reply"}
            </span>
          </button>
          <button
            type="button"
            onClick={mailtoFallback}
            className="frx-textlink text-step-xs"
            disabled={!subject.trim() || !message.trim()}
          >
            Open in email client instead
          </button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--text-faint)]">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
