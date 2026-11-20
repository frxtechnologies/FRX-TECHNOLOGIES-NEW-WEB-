"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ASSISTANT_ENTRIES, ASSISTANT_INTRO, type AssistantEntry } from "@/lib/assistant";
import { fetchPublishedAssistantEntries } from "@/lib/supabase/public";
import "./fx-assistant.css";

type Message = { role: "user"; text: string } | { role: "frx"; entry: AssistantEntry };

/** The assistant's face: a small bot head that blinks and tilts on hover. Original artwork. */
function BotFace({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`fxas-face ${className}`} aria-hidden="true">
      <path d="M24 8V3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="3.5" r="3" fill="var(--fx-sub)" />
      <rect x="6" y="9" width="36" height="30" rx="11" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="3" />
      <rect x="11" y="15" width="26" height="17" rx="8" fill="currentColor" />
      <g className="fxas-eyes" fill="var(--fx-sub)">
        <ellipse cx="18.5" cy="23.5" rx="2.8" ry="3.6" />
        <ellipse cx="29.5" cy="23.5" rx="2.8" ry="3.6" />
      </g>
      <path d="M20 29.5q4 3 8 0" stroke="var(--fx-sub)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * Ask FRX.
 *
 * Scripted, not generative: the visitor picks an authored question and gets the
 * authored answer, so it can never invent a capability, price or claim. Questions
 * and answers come from Supabase (admin → Quick Assistant) with the in-code list
 * as first paint and fallback — the real data path is unchanged.
 *
 * Reading comes first: the panel is large (a bottom sheet on phones), answers sit
 * in a full-width, comfortably set card, the question is a visibly separate bubble,
 * and there is a clear loading state, an empty/error state and one-tap "ask
 * another" / "start over". While it is open it tells the page (`data-assistant-open`)
 * so the WhatsApp control steps aside instead of colliding with it.
 */
export function QuickAssistant() {
  const [entries, setEntries] = useState<AssistantEntry[]>(ASSISTANT_ENTRIES);
  const [loadFailed, setLoadFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const panelId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedAssistantEntries().then((rows) => {
      if (cancelled) return;
      if (rows === null) return setLoadFailed(true); // the in-code answers stay available
      if (!rows.length) return;
      setEntries(
        rows.map((r) => ({
          id: r.id,
          question: r.question,
          chip: r.chip,
          answer: r.answer,
          actions: r.actions.length ? r.actions : undefined,
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const asked = new Set(messages.filter((m): m is Extract<Message, { role: "frx" }> => m.role === "frx").map((m) => m.entry.id));
  const remaining = entries.filter((e) => !asked.has(e.id));

  const ask = (entry: AssistantEntry) => {
    if (pending) return;
    setMessages((m) => [...m, { role: "user", text: entry.question }]);
    setPending(entry.question);
    // A short beat so the answer reads as a reply. Deliberately brief — no fake typing theatre.
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "frx", entry }]);
      setPending(null);
    }, 380);
  };

  // Tell the page, so the WhatsApp control can step aside while this is open.
  useEffect(() => {
    const root = document.documentElement;
    if (open) root.setAttribute("data-assistant-open", "");
    else root.removeAttribute("data-assistant-open");
    return () => root.removeAttribute("data-assistant-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcher.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = panel.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Bring the newest answer's TOP into view (not its bottom), so long answers start where reading starts.
  useEffect(() => {
    const el = log.current;
    if (!el) return;
    const last = el.querySelector<HTMLElement>("[data-last='true']");
    if (last) el.scrollTo({ top: Math.max(0, last.offsetTop - 12), behavior: "smooth" });
  }, [messages, pending]);

  return (
    <div className="fxas">
      <div
        ref={panel}
        id={panelId}
        role="dialog"
        aria-label="Ask FRX"
        aria-hidden={!open}
        data-open={open}
        className="fxas-panel"
      >
        <header className="fxas-head">
          <span className="fxas-id">
            <span className="fxas-avatar">
              <BotFace />
            </span>
            <span className="fxas-title">
              <strong>Ask FRX</strong>
              <small>Answers written by the FRX team</small>
            </span>
          </span>
          <span className="fxas-tools">
            {messages.length > 0 && (
              <button type="button" className="fxas-link" onClick={() => setMessages([])}>
                Start over
              </button>
            )}
            <button
              type="button"
              className="fxas-x"
              onClick={() => {
                setOpen(false);
                launcher.current?.focus();
              }}
              aria-label="Close assistant"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        </header>

        <div ref={log} className="fxas-log" aria-live="polite">
          <p className="fxas-intro">{ASSISTANT_INTRO}</p>

          {messages.map((m, i) =>
            m.role === "user" ? (
              <p key={i} className="fxas-q" data-last={i === messages.length - 1 && !pending}>
                {m.text}
              </p>
            ) : (
              <div key={i} className="fxas-a" data-last={i === messages.length - 1}>
                <span className="fxas-a-label">FRX</span>
                <p>{m.entry.answer}</p>
                {m.entry.actions && (
                  <div className="fxas-actions">
                    {m.entry.actions.map((a) =>
                      a.kind === "route" ? (
                        <Link key={a.label} href={a.href} onClick={() => setOpen(false)} className="fxas-act">
                          {a.label} <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className="fxas-act">
                          {a.label} <span aria-hidden="true">↗</span>
                        </a>
                      ),
                    )}
                  </div>
                )}
              </div>
            ),
          )}

          {pending && (
            <div className="fxas-a fxas-a--loading" data-last="true" role="status">
              <span className="fxas-a-label">FRX</span>
              <span className="fxas-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="fxas-sr">Finding an answer…</span>
            </div>
          )}

          {loadFailed && messages.length === 0 && (
            <p className="fxas-note" role="status">
              Live answers couldn’t be loaded, so you’re seeing the standard set. You can always{" "}
              <Link href="/contact" onClick={() => setOpen(false)}>
                contact us directly
              </Link>
              .
            </p>
          )}
        </div>

        <div className="fxas-foot">
          {remaining.length > 0 ? (
            <>
              <p className="fxas-foot-h">{messages.length ? "Ask another question" : "Pick a question"}</p>
              <div className="fxas-chips">
                {remaining.map((e) => (
                  <button key={e.id} type="button" className="fxas-chip" onClick={() => ask(e)} disabled={!!pending}>
                    {e.chip}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="fxas-end">
              <p>That’s everything I can answer here.</p>
              <Link href="/contact" onClick={() => setOpen(false)} className="fx-btn">
                Start a project <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <button
        ref={launcher}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="fxas-launcher"
        data-open={open}
      >
        <BotFace />
        <span className="fxas-launch-t">{open ? "Close" : "Ask FRX"}</span>
      </button>
    </div>
  );
}
