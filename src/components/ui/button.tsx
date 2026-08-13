"use client";

import Link from "next/link";
import { type ReactNode } from "react";

/**
 * The FRX primary action.
 *
 * Rectangular with a 4px radius — not a pill. The arrow lives in its own
 * bordered cell so the button reads as two parts, and on hover a layer sweeps
 * through from the left while the label and arrow shift. Identical geometry in
 * both themes; only the surface colour changes.
 */
export function ActionButton({
  href,
  children,
  variant = "primary",
  className = "",
  external,
  onClick,
  type,
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const surface =
    variant === "primary"
      ? "bg-[var(--frx-blue)] text-white border-[var(--frx-blue)]"
      : variant === "outline"
        ? "bg-transparent text-[var(--text)] border-[var(--border-strong)]"
        : "bg-transparent text-[var(--text)] border-transparent";

  const inner = (
    <>
      {/* Sweep layer. Scales from the left on hover, exits to the right. */}
      <span
        aria-hidden="true"
        className="frx-btn-sweep absolute inset-0 origin-left scale-x-0"
        style={{
          background:
            variant === "primary" ? "var(--frx-blue-bright)" : "var(--frx-blue)",
        }}
      />
      <span className="frx-btn-label relative z-10 px-[1.4em] py-[0.85em] leading-none">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="frx-btn-arrow relative z-10 grid w-[2.9em] shrink-0 place-items-center self-stretch overflow-hidden border-l"
        style={{ borderColor: "currentColor" }}
      >
        <svg viewBox="0 0 16 16" className="h-[0.85em] w-[0.85em]" fill="none" aria-hidden="true">
          <path
            d="M1 8h13M9 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="square"
          />
        </svg>
      </span>
    </>
  );

  // No font-size utility here: `.frx-btn` carries the default in the components
  // layer, so a caller passing `text-[…]` overrides it instead of colliding with
  // another utility in the same layer where source order decides the winner.
  const classes = `frx-btn group relative inline-flex items-stretch overflow-hidden border font-medium tracking-[-0.01em] ${surface} ${className}`;

  if (type) {
    return (
      <button type={type} onClick={onClick} className={classes} data-variant={variant}>
        {inner}
      </button>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={classes}
        data-variant={variant}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href ?? "/"} onClick={onClick} className={classes} data-variant={variant}>
      {inner}
    </Link>
  );
}

/** Text link with a rule that grows from the left. */
export function TextLink({
  href,
  children,
  external,
  className = "",
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
}) {
  const classes = `frx-textlink relative inline-block ${className}`;
  const body = (
    <>
      {children}
      <span aria-hidden="true" className="frx-textlink-rule" />
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {body}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {body}
    </Link>
  );
}
