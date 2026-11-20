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

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  /** Lifts the first-paint guard. Called by the loader, nowhere else. */
  releaseIntroGuard: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export { STORAGE_KEY as THEME_STORAGE_KEY };

/**
 * Runs before first paint and stamps data-theme on <html>, so the right palette
 * is in place when the document renders — no flash, and no hydration mismatch,
 * because React never renders the attribute itself.
 *
 * FRX is LIGHT by default. Dark is opt-in through the toggle, and an explicit
 * choice is remembered on every later visit. The visitor's OS preference is
 * deliberately not consulted: the brand opens white + blue.
 *
 * The same pass sets `data-intro-light`, which hides page content until the
 * loader has mounted and covered the viewport. Only routes that mount the
 * loader may sit behind it (the loader removes it), so /admin, the 404 page and
 * the internal review routes are excluded — on those it would be a blank page.
 *
 * Also marks the document JS-capable (`js-motion`). Masked-headline start
 * states are gated on this class, so it must land before first paint and must
 * never land at all if scripting is unavailable.
 */
export const themeScript = `(function(){var d=document.documentElement;try{
var s=localStorage.getItem("${STORAGE_KEY}");
var t=(s==="dark"||s==="light")?s:"light";
if(/^\\/($|about|services|contact|work)/.test(location.pathname))d.setAttribute("data-intro-light","1");
d.setAttribute("data-theme",t);d.style.colorScheme=t;
}catch(e){d.setAttribute("data-theme","light");}
d.classList.add("js-motion");})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Starts light to match the server render; the real value is read in an
  // effect, after the pre-paint script has already applied it visually.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") setThemeState(current);
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

  const releaseIntroGuard = useCallback(() => {
    document.documentElement.removeAttribute("data-intro-light");
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      releaseIntroGuard,
      toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, setTheme, releaseIntroGuard],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
