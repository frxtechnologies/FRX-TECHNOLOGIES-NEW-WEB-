"use client";

import { useTheme } from "@/components/providers/theme-provider";

/**
 * Deliberately not a labelled LIGHT/DARK switch. A single control whose two
 * glyphs cross-fade and rotate through each other — the state is legible from
 * the icon, and the accessible name carries the rest.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`frx-theme-toggle relative grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className="relative block h-4 w-4">
        {/* sun */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="frx-toggle-icon absolute inset-0 h-4 w-4"
          data-show={!isDark}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4.4" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        {/* moon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="frx-toggle-icon absolute inset-0 h-4 w-4"
          data-show={isDark}
          aria-hidden="true"
        >
          <path
            d="M20 13.4A8.2 8.2 0 0 1 10.6 4a8.4 8.4 0 1 0 9.4 9.4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
