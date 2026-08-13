"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ASSISTANT_ENTRIES, ASSISTANT_INTRO, type AssistantEntry } from "@/lib/assistant";
import { fetchPublishedAssistantEntries } from "@/lib/supabase/public";
import { FrxMark } from "@/components/brand/frx-logo";
import { ArrowIcon } from "@/components/ui/icons";

type Message =
  | { role: "user"; text: string }
  | { role: "frx"; entry: AssistantEntry };

/**
 * FRX Quick Assistant.
 *
 * Scripted, not generative: the visitor picks from authored questions and gets
 * authored answers. It cannot invent a capability, a price or a claim, which is
 * exactly why it's built this way rather than wired to a model.
 *
 * The questions themselves come from Supabase — editable from /admin — with
 * the hand-authored list in lib/assistant.ts as the first paint and the
 * fallback if Supabase is unreachable or the table is empty. A visitor never
 * sees an empty assistant because a network call was slow or failed.
 */
export function QuickAssistant() {
  const [entries, setEntries] = useState<AssistantEntry[]>(ASSISTANT_ENTRIES);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const panelId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedAssistantEntries().then((rows) => {
      if (cancelled || !rows?.length) return;
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

  const asked = new Set(
    messages.filter((m): m is Extract<Message, { role: "frx" }> => m.role === "frx").map((m) => m.entry.id),
  );
  const remaining = entries.filter((e) => !asked.has(e.id));

  const ask = (entry: AssistantEntry) => {
    setMessages((m) => [...m, { role: "user", text: entry.question }]);
    setPending(true);
    // A short beat so the answer reads as a reply rather than appearing with
    // the question. Deliberately brief — nobody wants a fake typing delay.
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "frx", entry }]);
      setPending(false);
    }, 340);
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcher.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = panel.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
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

  // Keep the newest exchange in view.
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  return (
    <div
      className="frx-assistant pointer-events-none fixed right-0 bottom-0 flex flex-col items-end gap-3 p-[max(1rem,env(safe-area-inset-bottom))]"
      style={{ zIndex: "var(--z-assistant)" }}
    >
      <div
        ref={panel}
        id={panelId}
        role="dialog"
        aria-label="FRX Quick Assistant"
        aria-hidden={!open}
        data-open={open}
        className="frx-assistant-panel pointer-events-auto flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--bg)]"
      >
        <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <span className="flex items-center gap-2.5">
            <FrxMark className="w-6" sizes="24px" />
            <span className="flex flex-col leading-tight">
              <span className="text-step-xs font-semibold">FRX Quick Assistant</span>
              <span className="text-[0.7rem] text-[var(--text-faint)]">Answers written by FRX</span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              launcher.current?.focus();
            }}
            aria-label="Close assistant"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--text-muted)]"
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" />
            </svg>
          </button>
        </header>

        <div ref={log} className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
          <p className="mb-4 text-step-xs leading-relaxed text-[var(--text-muted)]">
            {ASSISTANT_INTRO}
          </p>

          <ul className="flex flex-col gap-3">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <li key={i} className="frx-msg-user self-end">
                  {m.text}
                </li>
              ) : (
                <li key={i} className="frx-msg-frx">
                  <p>{m.entry.answer}</p>
                  {m.entry.actions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.entry.actions.map((a) =>
                        a.kind === "route" ? (
                          <Link
                            key={a.label}
                            href={a.href}
                            onClick={() => setOpen(false)}
                            className="frx-assistant-action"
                          >
                            {a.label}
                            <ArrowIcon className="h-2.5 w-2.5" />
                          </Link>
                        ) : (
                          <a
                            key={a.label}
                            href={a.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="frx-assistant-action"
                          >
                            {a.label}
                            <span aria-hidden="true">↗</span>
                          </a>
                        ),
                      )}
                    </div>
                  )}
                </li>
              ),
            )}
            {pending && (
              <li className="frx-msg-frx" aria-label="FRX is answering">
                <span className="frx-dots">
                  <i />
                  <i />
                  <i />
                </span>
              </li>
            )}
          </ul>
        </div>

        <div className="border-t border-[var(--border)] px-4 py-3">
          {remaining.length > 0 ? (
            <>
              <p className="t-eyebrow mb-2.5 text-[0.65rem]">
                {messages.length ? "Ask something else" : "Pick a question"}
              </p>
              <div className="flex flex-wrap gap-2">
                {remaining.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => ask(e)}
                    className="frx-assistant-chip"
                  >
                    {e.chip}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-step-xs text-[var(--text-muted)]">
                That&apos;s everything I&apos;m able to answer.
              </p>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="frx-assistant-action"
              >
                Start a Project
                <ArrowIcon className="h-2.5 w-2.5" />
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
        className="frx-assistant-launcher pointer-events-auto"
      >
        <span className="frx-assistant-launcher-dot" aria-hidden="true" />
        <span>{open ? "Close" : "Ask FRX"}</span>
      </button>
    </div>
  );
}
