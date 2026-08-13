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

export type Theme = "light" | "dark";

const STORAGE_KEY = "frx-theme";

/** Shared with FrxLoader — both need to know whether this is the first visit. */
export const INTRO_KEY = "frx-intro-played";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  /** Plays the one-off light→dark opening. Called by the loader, nowhere else. */
  runIntroTransform: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export { STORAGE_KEY as THEME_STORAGE_KEY };

/**
 * Runs before first paint. Reads the stored choice, falls back to the OS
 * preference, and stamps data-theme on <html> so the correct palette is already
 * in place when the document renders — no flash, and no hydration mismatch,
 * because React never renders the attribute itself.
 *
 * FRX opens in light mode by default: a first-time visitor with no stored
 * choice and no OS preference gets white + blue, then transforms into dark.
 */
/**
 * Runs before first paint.
 *
 * Resolution order:
 *  1. an explicit stored choice always wins, on every visit
 *  2. otherwise, the first visit of a session opens in LIGHT — the intro plays
 *     white, then crossfades into dark as the loader clears
 *  3. later navigations in the same session use the OS preference
 *
 * Step 2 is the reason the theme is stamped here rather than in React: the
 * light frame has to be correct on the very first paint or the "opens light"
 * beat is just a flash of the wrong colour.
 */
export const themeScript = `(function(){var d=document.documentElement;try{
var s=localStorage.getItem("${STORAGE_KEY}");
var t;
if(s==="dark"||s==="light"){t=s;}
else if(!sessionStorage.getItem("${INTRO_KEY}")){t="light";d.setAttribute("data-intro-light","1");}
else{t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
d.setAttribute("data-theme",t);d.style.colorScheme=t;
}catch(e){d.setAttribute("data-theme","light");}
/* Same pass marks the document JS-capable. The masked-headline start states
   are gated on this class, so they must land before first paint — and must
   never land at all if scripting is unavailable. */
d.classList.add("js-motion");})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Starts light to match the server render; the real value is read in an
  // effect, after the pre-paint script has already applied it visually.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") setThemeState(current);
  }, []);

  // Follow the OS only while the visitor has not made an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      setThemeState(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;

    // Colour crossfades for the duration of the swap only. Leaving the
    // transition on permanently would drag every GSAP-driven colour change
    // through a 450ms tween.
    root.classList.add("theme-transition");
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the choice just won't persist */
    }
    setThemeState(next);

    window.setTimeout(() => root.classList.remove("theme-transition"), 500);
  }, []);

  /**
   * The opening beat: the site arrives white, then resolves into black as the
   * intro clears. Called once by the loader.
   *
   * Deliberately does NOT write to localStorage — this is a presentation
   * choice, not the visitor's, so the toggle still behaves normally afterwards
   * and a return visit follows the OS preference. Anyone who has already picked
   * a theme, or who has asked for reduced motion, skips the whole thing.
   */
  const runIntroTransform = useCallback(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-intro-light")) return;
    root.removeAttribute("data-intro-light");

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* storage blocked — fall through and play it */
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.add("theme-transition", "theme-transition-slow");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
    setThemeState("dark");

    window.setTimeout(
      () => root.classList.remove("theme-transition", "theme-transition-slow"),
      1000,
    );
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      runIntroTransform,
      toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, setTheme, runIntroTransform],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
