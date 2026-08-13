"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { NAV_LINKS, SOCIAL } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";
import { InstagramIcon, LinkedInIcon } from "@/components/ui/icons";

/**
 * Full-screen navigation. Not a dropdown — the interface becomes the menu.
 *
 * Opens with a blue panel wiping up from the bottom, then the links rise
 * through their masks in sequence. Closing reverses the whole thing rather than
 * cutting, so the two directions feel like one movement.
 */
export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const ctx = useRef<gsap.Context | null>(null);
  const pathname = usePathname();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  /**
   * The timeline is built on first open, not on mount.
   *
   * Building it in a mount effect looked cleaner but was fragile: the effect's
   * cleanup reverts the GSAP context, which kills the timeline, and under
   * StrictMode's mount→cleanup→mount the cached handle could end up pointing at
   * a reverted timeline. `play()` then did nothing and the menu stayed off
   * screen while the scroll lock still engaged — open in every respect except
   * visible. Creating it on demand removes the ordering hazard entirely, and it
   * is still built only once, so open and close remain one reversible movement.
   */
  const ensureTimeline = useCallback(() => {
    if (tl.current) return tl.current;
    const el = root.current;
    if (!el) return null;

    ctx.current = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t = gsap.timeline({ paused: true });

      if (reduced) {
        t.set(el, { autoAlpha: 1 })
          .set(".menu-panel", { yPercent: 0 })
          .set(".menu-label", { yPercent: 0 })
          .set(".menu-foot", { opacity: 1 })
          .set(".menu-rule", { scaleX: 1 });
      } else {
        t.set(el, { autoAlpha: 1 })
          .fromTo(
            ".menu-panel",
            { yPercent: 100 },
            { yPercent: 0, duration: 0.66, ease: "expo.inOut" },
          )
          .fromTo(
            ".menu-label",
            { yPercent: 110, y: 0 },
            { yPercent: 0, y: 0, duration: 0.72, stagger: 0.06, ease: "expo.out" },
            "-=0.34",
          )
          .fromTo(
            ".menu-rule",
            { scaleX: 0 },
            { scaleX: 1, duration: 0.6, stagger: 0.06, ease: "power2.out" },
            "<",
          )
          .fromTo(
            ".menu-foot",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            "-=0.4",
          );
      }

      tl.current = t;
    }, el);

    return tl.current;
  }, []);

  useEffect(
    () => () => {
      ctx.current?.revert();
      ctx.current = null;
      tl.current = null;
    },
    [],
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const t = ensureTimeline();
    if (!t) return;

    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      t.timeScale(1).play();
      // Scroll lock without layout shift from the disappearing scrollbar.
      const gap = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = gap > 0 ? `${gap}px` : "";
      el.querySelector<HTMLElement>("[data-menu-first]")?.focus();
    } else {
      t.timeScale(1.5).reverse();
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      previouslyFocused.current?.focus?.();
    }
  }, [open, ensureTimeline]);

  // Close on route change and on Escape; trap Tab inside the panel.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = root.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

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
  }, [open, onClose]);

  useEffect(() => {
    if (open) onClose();
    // Route changed — close without re-running for onClose identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      ref={root}
      className="fixed inset-0 invisible opacity-0 lg:hidden"
      style={{ zIndex: "var(--z-menu)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!open}
    >
      <div className="menu-panel absolute inset-0 flex flex-col bg-[var(--bg)]">
        {/* A single blue signal edge along the top — the motif, not decoration. */}
        <span className="signal-rule absolute inset-x-0 top-0" />

        <div className="flex items-center justify-between px-[var(--gutter)] pt-5">
          <span className="t-eyebrow">Menu</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={onClose}
              data-menu-first
              aria-label="Close navigation"
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] text-[var(--text-muted)]"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  d="M2 2l12 12M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="square"
                />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex flex-1 flex-col justify-center px-[var(--gutter)]">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className="menu-link relative block border-t border-[var(--border)] py-[0.35em] text-[clamp(2.4rem,13vw,4.5rem)] leading-[1.05] font-medium tracking-[-0.045em] uppercase"
              >
                {/* The mask is its own element: putting it on the link would
                    clip the rule and make the link's padding part of the
                    animated distance. */}
                <span className="reveal-mask">
                  <span className="menu-label flex items-baseline gap-4">
                    {link.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 self-center rounded-full bg-[var(--accent)]"
                      />
                    )}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="menu-rule absolute inset-x-0 top-0 h-px origin-left bg-[var(--accent)]"
                />
              </Link>
            );
          })}
        </nav>

        <div className="menu-foot flex flex-col gap-5 px-[var(--gutter)] pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <span className="signal-tick" />
          <div className="flex items-center gap-5">
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[var(--text-muted)]"
            >
              <InstagramIcon className="h-4 w-4" />
              <span className="text-step-xs">Instagram</span>
            </a>
            <a
              href={SOCIAL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[var(--text-muted)]"
            >
              <LinkedInIcon className="h-4 w-4" />
              <span className="text-step-xs">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
