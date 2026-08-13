"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/site";
import { FrxLogo } from "@/components/brand/frx-logo";
import { ThemeToggle } from "./theme-toggle";
import { MobileMenu } from "./mobile-menu";
import { ArrowIcon } from "@/components/ui/icons";

/**
 * The navigation belongs to the hero at the top of the page — transparent, wide
 * and spacious. Past the fold it contracts into a floating bar.
 *
 * The transition is driven by a single `data-compact` attribute and CSS
 * transitions rather than a scroll-linked tween: it needs to move once, in one
 * direction, not track the scroll position frame by frame. A hysteresis gap
 * stops it flickering when someone parks the page right on the threshold.
 */
export function Navbar() {
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  // Interior pages have no full-height hero, so they start compact.
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setCompact(true);
      return;
    }

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        // Compacts early on purpose. While it is transparent the nav sits
        // directly on the hero, so the logo has to gain its scrim before the
        // headline scrolls up underneath it. The gap between the two numbers is
        // hysteresis — without it, parking the page on the threshold makes the
        // bar flicker between states.
        setCompact((was) => (was ? y > 24 : y > 56));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isHome]);

  return (
    <>
      <a href="#main" className="frx-skip">
        Skip to content
      </a>

      <header
        ref={ref}
        data-compact={compact}
        className="frx-nav fixed inset-x-0 top-0"
        style={{ zIndex: "var(--z-nav)" }}
      >
        <div className="frx-nav-inner">
          <div className="frx-nav-bar">
            <Link
              href="/"
              aria-label="FRX Technologies — home"
              className="frx-nav-logo shrink-0"
            >
              <FrxLogo sizes="(max-width: 1024px) 130px, 170px" priority />
            </Link>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV_LINKS.map((link) => {
                  const active =
                    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        data-active={active}
                        className="frx-nav-link"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2 lg:gap-3">
              <ThemeToggle />

              <Link href="/contact" className="frx-nav-cta hidden sm:inline-flex">
                <span>Start a Project</span>
                <ArrowIcon className="h-3 w-3" />
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation"
                aria-expanded={menuOpen}
                className="frx-nav-burger lg:hidden"
              >
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
