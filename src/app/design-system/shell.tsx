"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFx } from "@/design-system/motion/fx";
import { FxDefs } from "@/design-system/outline";

const NAV = [
  ["type", "Typography"],
  ["outline", "Outline"],
  ["colour", "Colour"],
  ["scale", "Scale"],
  ["space", "Space"],
  ["motion", "Motion"],
  ["code", "Tokens"],
] as const;

/**
 * Review shell. Owns the LOCAL theme (light by default) and mounts the
 * data-fx controller once for the whole page.
 *
 * The theme is scoped to `.fx-root` on purpose: the showcase must not touch the
 * site's real ThemeProvider. At adoption, ThemeProvider writes the same
 * `data-fx-theme` attribute.
 */
export function Shell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useFx(ref);

  const toggle = () => {
    const el = ref.current;
    el?.classList.add("fx-theme-fading");
    setTheme((t) => (t === "light" ? "dark" : "light"));
    window.setTimeout(() => el?.classList.remove("fx-theme-fading"), 650);
  };

  return (
    <div ref={ref} className="fx-root sc-root" data-fx-theme={theme}>
      <FxDefs />

      <header className="sc-bar">
        <a className="sc-bar-brand fx-label" href="#top">
          FRX · design system <span className="fx-faint">review</span>
        </a>
        <nav className="sc-bar-nav" aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="fx-nav fx-link">
              {label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="sc-theme"
          onClick={toggle}
          aria-pressed={theme === "dark"}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span aria-hidden="true" className="sc-theme-dot" />
          <span className="fx-label">{theme === "dark" ? "Dark" : "Light"}</span>
        </button>
      </header>

      {children}
    </div>
  );
}
