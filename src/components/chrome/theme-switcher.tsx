"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { PALETTES, type Palette } from "@/lib/theme-config";
import "./theme-switcher.css";

function Swatch({ id, mode }: { id: Palette; mode: "light" | "dark" }) {
  const p = PALETTES.find((x) => x.id === id)!;
  const [primary, sub, ground] = p.swatch[mode];
  return (
    <span className="fxts-sw" aria-hidden="true" style={{ background: ground }}>
      <i style={{ background: primary }} />
      <i style={{ background: sub }} />
    </span>
  );
}

function Options() {
  const { theme, palette, enabled, setTheme, setPalette } = useTheme();
  const list = PALETTES.filter((p) => enabled.includes(p.id));

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = list[(i + dir + list.length) % list.length];
    setPalette(next.id);
    (e.currentTarget.parentElement?.querySelectorAll("button")[(i + dir + list.length) % list.length] as HTMLElement | undefined)?.focus();
  };

  return (
    <>
      {list.length > 1 && (
        <div className="fxts-list" role="radiogroup" aria-label="Colour theme">
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={palette === p.id}
              tabIndex={palette === p.id ? 0 : -1}
              className="fxts-opt"
              data-on={palette === p.id}
              onClick={() => setPalette(p.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <Swatch id={p.id} mode={theme} />
              <span className="fxts-txt">
                <strong>{p.name}</strong>
                <small>{p.blurb}</small>
              </span>
              <span className="fxts-tick" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
      <div className="fxts-mode" role="group" aria-label="Appearance">
        {(["light", "dark"] as const).map((m) => (
          <button key={m} type="button" aria-pressed={theme === m} onClick={() => setTheme(m)}>
            {m === "light" ? "Light" : "Dark"}
          </button>
        ))}
      </div>
    </>
  );
}

/**
 * Compact theme control: four palettes × light/dark. A single round button in the
 * nav (a two-dot swatch of the current palette) opens a small panel — a popover
 * on desktop, a bottom sheet on phones — or, with `inline`, the options render
 * directly (used inside the mobile menu). Hidden entirely when the admin has
 * locked the site to its default look.
 */
export function ThemeSwitcher({ inline = false }: { inline?: boolean }) {
  const { theme, palette, allowSwitch } = useTheme();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!allowSwitch) return null;
  if (inline) {
    return (
      <div className="fxts-inline">
        <p className="fxts-h">Theme</p>
        <Options />
      </div>
    );
  }

  const name = PALETTES.find((p) => p.id === palette)?.name ?? "Theme";
  return (
    <div className="fxts" ref={root}>
      <button
        type="button"
        className="fxts-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Theme: ${name}, ${theme} mode. Change theme`}
        onClick={() => setOpen((o) => !o)}
      >
        <Swatch id={palette} mode={theme} />
      </button>
      {open && (
        <div className="fxts-panel" role="dialog" aria-label="Theme options">
          <p className="fxts-h">Theme</p>
          <Options />
        </div>
      )}
    </div>
  );
}
