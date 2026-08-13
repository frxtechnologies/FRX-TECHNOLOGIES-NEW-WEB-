"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal, RevealLines } from "@/components/ui/reveal";

export type Breadcrumb = { label: string; href?: string };

/**
 * Interior page hero. Shares the site's language with the homepage hero but not
 * its composition — no full-height stage, no beam, a horizon rule instead. The
 * pages should feel related, not repeated.
 */
export function PageHero({
  eyebrow,
  index,
  lines,
  body,
  children,
  variant = "default",
  breadcrumbs,
}: {
  eyebrow: string;
  index?: string;
  lines: ReactNode[];
  body?: string;
  children?: ReactNode;
  variant?: "default" | "wide";
  /** Optional — only the routes with a real hierarchy worth surfacing pass this. */
  breadcrumbs?: Breadcrumb[];
}) {
  return (
    <section className="page-hero relative overflow-clip">
      <span className="page-hero-light" aria-hidden="true" />

      <div className="container relative">
        {breadcrumbs && (
          <nav aria-label="Breadcrumb" className="pb-4">
            <ol className="flex flex-wrap items-center gap-x-2 text-[0.72rem] text-[var(--text-faint)]">
              {breadcrumbs.map((b, i) => (
                <li key={b.label} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {b.href ? (
                    <Link href={b.href} className="frx-textlink">
                      {b.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{b.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="flex items-center justify-between gap-6 pb-[clamp(2.5rem,6vw,5rem)]">
          <p className="t-eyebrow flex items-center gap-3">
            <span className="signal-tick" />
            {eyebrow}
          </p>
          {index && <p className="t-index text-step-xs text-[var(--text-faint)]">{index}</p>}
        </div>

        <RevealLines
          as="h1"
          className={variant === "wide" ? "t-display max-w-[20ch]" : "t-display max-w-[15ch]"}
          lines={lines}
        />

        {body && (
          <Reveal className="mt-8 max-w-[54ch]" delay={0.12}>
            <p className="t-lead">{body}</p>
          </Reveal>
        )}

        {children && (
          <Reveal className="mt-10" delay={0.18}>
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
