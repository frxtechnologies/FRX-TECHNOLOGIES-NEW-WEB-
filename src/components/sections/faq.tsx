"use client";

import { useRef, useState } from "react";
import {  } from "@/components/art/characters";
import { ChatBuddy, PhoneBuddy } from "@/components/art/scenes";
import { useArtLife } from "@/components/motion/use-art-life";

export type FaqItem = { question: string; answer: string };

/**
 * "Things you might ask." A real accordion — each question is a button with
 * aria-expanded controlling its region — whose panels animate by transitioning
 * grid rows (0fr → 1fr), so the height is always the true content height with
 * no JavaScript measuring. Beside it a chat-bubble character reacts: it nods
 * (pops) whenever a question opens. Content is editable in admin → FAQ.
 */
export function Faq({ faqs }: { faqs: FaqItem[] }) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);
  const [nod, setNod] = useState(0);
  useArtLife(root);

  if (!faqs.length) return null;
  return (
    <section ref={root} className="fxfaq" data-glow id="faq" aria-labelledby="fxfaq-title">
      <div className="fx-container fxfaq-wrap">
        <div className="fxfaq-side">
          <h2 id="fxfaq-title" className="fxfaq-h fx-d1 fx-up" data-fx="reveal-lines">
            Things you might ask.
          </h2>
          <div className="fxfaq-art" aria-hidden="true">
            <span className="fxfaq-char fxfaq-char--chat" key={nod} data-nod={nod > 0}>
              <ChatBuddy className="fxfaq-svg fxa-bob" />
            </span>
            <span className="fxfaq-char fxfaq-char--phone">
              <PhoneBuddy className="fxfaq-svg fxa-bob" />
            </span>
            <span className="fxfaq-q" aria-hidden="true">?</span>
          </div>
        </div>

        <ul className="fxfaq-list">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.question} className="fxfaq-item" data-open={isOpen}>
                <h3>
                  <button
                    type="button"
                    className="fxfaq-q-btn"
                    aria-expanded={isOpen}
                    aria-controls={`fxfaq-p-${i}`}
                    id={`fxfaq-b-${i}`}
                    onClick={() => {
                      setOpen(isOpen ? null : i);
                      if (!isOpen) setNod((n) => n + 1);
                    }}
                  >
                    <span className="fxfaq-num fx-label">{String(i + 1).padStart(2, "0")}</span>
                    <span className="fxfaq-text fx-h3">{f.question}</span>
                    <span className="fxfaq-plus" aria-hidden="true" />
                  </button>
                </h3>
                <div id={`fxfaq-p-${i}`} role="region" aria-labelledby={`fxfaq-b-${i}`} className="fxfaq-panel">
                  <div className="fxfaq-panel-in">
                    <p className="fx-body">{f.answer}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
