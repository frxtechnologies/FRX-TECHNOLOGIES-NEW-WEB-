"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PALETTE_IDS, type Mode, type Palette, type ThemeConfig } from "@/lib/theme-config";

export type Theme = Mode;

import { MODE_KEY, PALETTE_KEY } from "@/lib/theme-config";

type ThemeContextValue = {
  /** light | dark */
  theme: Mode;
  palette: Palette;
  enabled: Palette[];
  /** false when the admin has locked the site to its default look. */
  allowSwitch: boolean;
  setTheme: (t: Mode) => void;
  setPalette: (p: Palette) => void;
  toggle: () => void;
  /** Lifts the first-paint guard. Called by the loader, nowhere else. */
  releaseIntroGuard: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ config, children }: { config: ThemeConfig; children: ReactNode }) {
  // Initial state matches the server render; the real values are read in an
  // effect, after the pre-paint script has already applied them visually.
  const [theme, setThemeState] = useState<Mode>(config.mode);
  const [palette, setPaletteState] = useState<Palette>(config.palette);

  useEffect(() => {
    const root = document.documentElement;
    const m = root.getAttribute("data-theme");
    const p = root.getAttribute("data-palette");
    if (m === "dark" || m === "light") setThemeState(m);
    if (p && (PALETTE_IDS as string[]).includes(p)) setPaletteState(p as Palette);
  }, []);

  /** Colours cross-fade for the duration of the swap only (never transforms). */
  const swap = useCallback((apply: () => void) => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    apply();
    window.setTimeout(() => root.classList.remove("theme-transition"), 500);
  }, []);

  const setTheme = useCallback(
    (next: Mode) => {
      swap(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", next);
        root.style.colorScheme = next;
        try {
          localStorage.setItem(MODE_KEY, next);
        } catch {
          /* private mode — the choice just won't persist */
        }
        setThemeState(next);
      });
    },
    [swap],
  );

  const setPalette = useCallback(
    (next: Palette) => {
      swap(() => {
        document.documentElement.setAttribute("data-palette", next);
        try {
          localStorage.setItem(PALETTE_KEY, next);
        } catch {
          /* ignore */
        }
        setPaletteState(next);
      });
    },
    [swap],
  );

  const releaseIntroGuard = useCallback(() => {
    document.documentElement.removeAttribute("data-intro-light");
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      palette,
      enabled: config.enabled,
      allowSwitch: config.allow,
      setTheme,
      setPalette,
      releaseIntroGuard,
      toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, palette, config.enabled, config.allow, setTheme, setPalette, releaseIntroGuard],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
