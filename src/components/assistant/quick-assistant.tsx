"use client";

import Link from "next/link";
import { Fragment, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ASSISTANT_ENTRIES, ASSISTANT_INTRO, type AssistantAction, type AssistantEntry } from "@/lib/assistant";
import { fetchPublishedAssistantEntries } from "@/lib/supabase/public";
import "./fx-assistant.css";

/** `text` = a live AI answer; `entry` = an authored answer (scripted mode, or the AI fallback). */
type Message =
  | { role: "user"; text: string }
  | { role: "frx"; text?: string; entry?: AssistantEntry; actions?: AssistantAction[]; error?: boolean };

const AI_INTRO =
  "Ask me about what FRX builds: websites, software, AI automation. I’m an AI assistant, so for quotes and exact scope the FRX team replies personally.";
const MAX_LEN = 500;
const CONTACT_ACTION: AssistantAction = { kind: "route", label: "Contact the team", href: "/contact" };

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
 * Renders an AI answer as TEXT: paragraphs for blank lines, and only http(s) links and
 * email addresses become clickable. Nothing from the model is ever injected as HTML.
 */
function Rich({ text }: { text: string }) {
  const re = /(https?:\/\/[^\s<>"')]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>
          {para.split(/\n/).map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {line.split(re).map((part, k) => {
                if (k % 2 === 0) return part;
                const trail = part.match(/[.,;:!?]+$/)?.[0] ?? "";
                const clean = trail ? part.slice(0, -trail.length) : part;
                const href = clean.includes("@") && !clean.startsWith("http") ? `mailto:${clean}` : clean;
                return (
                  <Fragment key={k}>
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="fxas-inl">
                      {clean}
                    </a>
                    {trail}
                  </Fragment>
                );
              })}
            </Fragment>
          ))}
        </p>
      ))}
    </>
  );
}

/**
 * Ask FRX.
 *
 * Two modes, chosen when the panel first opens:
 *  - AI (when the server has ASSISTANT_WEBHOOK_URL): a free-text chat answered by the FRX
 *    assistant on Make. Visitors can type or tap a suggested question. If the AI can't be
 *    reached, a suggested question still gets its authored answer and typed questions get
 *    an honest "couldn't reach it" message with a way to contact the team.
 *  - Scripted (otherwise): the visitor picks an authored question and gets the authored
 *    answer, exactly as before — it can never invent a capability, price or claim.
 *
 * Reading comes first: a large panel (a bottom sheet on phones), full-width answer cards,
 * the question as a visibly separate bubble, a loading state, one-tap "start over". While it
 * is open it tells the page (`data-assistant-open`) so WhatsApp steps aside.
 */
export function QuickAssistant() {
  const [entries, setEntries] = useState<AssistantEntry[]>(ASSISTANT_ENTRIES);
  const [loadFailed, setLoadFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"checking" | "ai" | "scripted">("checking");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");
  const panelId = useId();
  const inputId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const run = useRef(0); // bumps on "Start over" so a late reply for an old conversation is dropped

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

  // First time the panel opens: is the AI connected on the server?
  useEffect(() => {
    if (!open || mode !== "checking") return;
    let cancelled = false;
    fetch("/api/assistant", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d: { enabled?: boolean }) => !cancelled && setMode(d.enabled ? "ai" : "scripted"))
      .catch(() => !cancelled && setMode("scripted"));
    return () => {
      cancelled = true;
    };
  }, [open, mode]);

  const asked = new Set(
    messages.filter((m): m is Extract<Message, { role: "frx" }> => m.role === "frx" && !!m.entry).map((m) => m.entry!.id),
  );
  const askedQuestions = new Set(messages.filter((m) => m.role === "user").map((m) => (m as { text: string }).text));
  const remaining = entries.filter((e) => !asked.has(e.id) && !askedQuestions.has(e.question));

  /** Scripted answer: a short beat so it reads as a reply. Deliberately brief, no fake typing theatre. */
  const askScripted = (entry: AssistantEntry) => {
    if (pending) return;
    const id = run.current;
    setMessages((m) => [...m, { role: "user", text: entry.question }]);
    setPending(true);
    window.setTimeout(() => {
      if (id !== run.current) return;
      setMessages((m) => [...m, { role: "frx", entry }]);
      setPending(false);
    }, 380);
  };

  /** AI answer via our server route. `fallback` is the authored answer for a tapped suggestion. */
  const askAI = async (text: string, fallback?: AssistantEntry) => {
    const q = text.trim().slice(0, MAX_LEN);
    if (!q || pending) return;
    const id = run.current;
    const history = messages
      .map((m) => (m.role === "user" ? { role: "user", text: m.text } : { role: "frx", text: m.text ?? m.entry?.answer ?? "" }))
      .filter((t) => t.text)
      .slice(-10);
    setMessages((m) => [...m, { role: "user", text: q }]);
    setDraft("");
    setPending(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; answer?: string; reason?: string };
      if (id !== run.current) return;
      if (res.ok && data.ok && data.answer) {
        setMessages((m) => [...m, { role: "frx", text: data.answer }]);
      } else if (fallback) {
        setMessages((m) => [...m, { role: "frx", entry: fallback }]); // the authored answer is still right
      } else {
        const text =
          data.reason === "rate"
            ? "You’ve asked a lot of questions in a short time. Please give it a few minutes, or contact the team directly."
            : "I couldn’t reach the assistant just now. Please try again in a moment, or contact the team directly.";
        setMessages((m) => [...m, { role: "frx", text, error: true, actions: [CONTACT_ACTION] }]);
      }
    } catch {
      if (id !== run.current) return;
      if (fallback) setMessages((m) => [...m, { role: "frx", entry: fallback }]);
      else
        setMessages((m) => [
          ...m,
          { role: "frx", text: "I couldn’t reach the assistant just now. Please check your connection and try again, or contact the team directly.", error: true, actions: [CONTACT_ACTION] },
        ]);
    } finally {
      if (id === run.current) setPending(false);
    }
  };

  const pick = (entry: AssistantEntry) => (mode === "ai" ? askAI(entry.question, entry) : askScripted(entry));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    askAI(draft);
  };

  const startOver = () => {
    run.current += 1;
    setMessages([]);
    setPending(false);
    setDraft("");
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
      const items = panel.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled])");
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

  // Typing is the point of the AI chat: put the cursor there once it has answered.
  useEffect(() => {
    if (open && mode === "ai" && !pending && messages.length && window.matchMedia("(hover: hover)").matches) input.current?.focus();
  }, [pending, open, mode, messages.length]);

  const ai = mode === "ai";

  return (
    <div className="fxas">
      <div
        ref={panel}
        id={panelId}
        role="dialog"
        aria-label="Ask FRX"
        aria-hidden={!open}
        data-open={open}
        data-mode={mode}
        className="fxas-panel"
      >
        <header className="fxas-head">
          <span className="fxas-id">
            <span className="fxas-avatar">
              <BotFace />
            </span>
            <span className="fxas-title">
              <strong>Ask FRX</strong>
              <small>{ai ? "AI assistant · can make mistakes" : "Answers written by the FRX team"}</small>
            </span>
          </span>
          <span className="fxas-tools">
            {messages.length > 0 && (
              <button type="button" className="fxas-link" onClick={startOver}>
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
          <p className="fxas-intro">{ai ? AI_INTRO : ASSISTANT_INTRO}</p>

          {messages.map((m, i) =>
            m.role === "user" ? (
              <p key={i} className="fxas-q" data-last={i === messages.length - 1 && !pending}>
                {m.text}
              </p>
            ) : (
              <div key={i} className={`fxas-a${m.error ? " fxas-a--error" : ""}`} data-last={i === messages.length - 1}>
                <span className="fxas-a-label">FRX</span>
                {m.text ? <Rich text={m.text} /> : <p>{m.entry?.answer}</p>}
                {(m.actions ?? m.entry?.actions) && (
                  <div className="fxas-actions">
                    {(m.actions ?? m.entry?.actions)!.map((a) =>
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
              <span className="fxas-sr">{ai ? "Thinking…" : "Finding an answer…"}</span>
            </div>
          )}

          {loadFailed && messages.length === 0 && !ai && (
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
          {ai && (
            <form className="fxas-form" onSubmit={submit}>
              <label htmlFor={inputId} className="fxas-sr">
                Your question for FRX
              </label>
              <input
                ref={input}
                id={inputId}
                className="fxas-input"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={MAX_LEN}
                placeholder="Type your question…"
                autoComplete="off"
                enterKeyHint="send"
                disabled={pending}
              />
              <button type="submit" className="fxas-send" disabled={pending || !draft.trim()} aria-label="Send question">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3 10h13M11 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </button>
            </form>
          )}

          {(!ai || messages.length === 0) && remaining.length > 0 && (
            <>
              <p className="fxas-foot-h">{ai ? "Or try one of these" : messages.length ? "Ask another question" : "Pick a question"}</p>
              <div className="fxas-chips">
                {remaining.map((e) => (
                  <button key={e.id} type="button" className="fxas-chip" onClick={() => pick(e)} disabled={pending}>
                    {e.chip}
                  </button>
                ))}
              </div>
            </>
          )}

          {!ai && remaining.length === 0 && (
            <div className="fxas-end">
              <p>That’s everything I can answer here.</p>
              <Link href="/contact" onClick={() => setOpen(false)} className="fx-btn">
                Start a project <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}

          {ai && <p className="fxas-privacy">Please don’t share passwords or payment details. If you leave contact details, the FRX team may follow up.</p>}
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
