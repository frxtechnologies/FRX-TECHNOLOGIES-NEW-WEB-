# FRX Technologies

The official FRX Technologies website. Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis.

```bash
npm run dev
```

```bash
npm run build
```

---

## Brand assets are generated, not hand-made

Every brand asset in `public/` is derived from **one** source file — the official logo artwork — by `scripts/brand-assets.mjs`. Nothing is redrawn or re-typeset.

```bash
node scripts/brand-assets.mjs <path-to-official-logo.png>
node scripts/favicon-ico.mjs
```

The script:

- **samples the brand blue** from the X itself. The dominant saturated blue is `#045cec` and the lit leading edge is `#008cff`. Both become CSS custom properties; no other blue appears anywhere in the project.
- **emits the dark-mode lockup** by recolouring only the navy letterforms to white. The blue X and the two rules under `TECHNOLOGIES` are left exactly as designed.
- **crops the X** for icons. The full lockup is roughly 3.4:1 and turns to mush at 16px, so the favicon uses the X — measured from the real artwork's blue mass, not approximated.

| Output | Used for |
| --- | --- |
| `brand/frx-logo-light-mode.png` | the supplied original — light mode |
| `brand/frx-logo-dark-mode.png` | white letterforms — dark mode |
| `brand/frx-x.png` | the X alone, for tight UI |
| `icons/icon-{16..512}.png` | favicons, touch icon, manifest |
| `app/favicon.ico` | multi-size ICO (16/32/48) |
| `brand/og.jpg` | social preview, from the supplied banner |
| `images/frx-signal-{wide,tall}.webp` | banner artwork, cropped clear of its typography |

The banner is handled by `scripts/feature-art.mjs`. Its left two-thirds are a
logo lockup, a headline and service icons — content the site already carries, in
a different typeface — so only the right-hand panel is used: the blue diagonal
and the particle wave, no type. That crop backs the "Less Work. More Growth."
band and the reel poster. The full banner is used intact only as the OG image,
where its own typography is the point.

Both lockups ship on every page and CSS picks one (`.frx-logo-light` / `.frx-logo-dark`), so the correct mark is on screen at first paint rather than after a JS theme read.

## Sending replies from the admin panel

`/admin/inquiries` can reply to a submission by email, via
`src/app/api/admin/reply/route.ts`. Two server-only env vars gate it:

```
RESEND_API_KEY=...
RESEND_FROM_EMAIL="FRX Technologies <hello@yourverifieddomain.com>"
```

Neither is `NEXT_PUBLIC_*` — the route runs server-side, so the key never
reaches the browser. The `from` address has to be on a domain verified in
Resend; their sandbox sender can't deliver to arbitrary inboxes.

Without both set, the route reports `unconfigured` and the admin UI falls
back to a prefilled mailto — same honest-fallback shape as the public contact
form when it has no backend wired up. Nothing ever claims to have sent an
email it didn't.

## Outstanding asset

`public/images/founders/raaef-usman.png` is **not yet supplied.** Until it lands, `FounderPortrait` renders a branded monogram panel at identical dimensions and weight, so the founding pair stays balanced rather than showing a broken image. Drop the file at that path and it takes over — no other change.

## Content rules this codebase enforces

- No fabricated clients, projects, testimonials, revenue or success rates. `CAPABILITY_STATS` in `lib/site.ts` holds only counts that are true today (service lines, technologies, founders).
- The Quick Assistant is **scripted**, not generative. Every question and answer is authored in `lib/assistant.ts`, so it cannot invent a capability or a price.
- The contact form does **not** claim to send anything. `NEXT_PUBLIC_ENQUIRY_ENDPOINT` is the single integration point; with nothing configured the form says so plainly and offers a prefilled mailto, rather than showing a success state over a message that went nowhere.

## Architecture notes worth knowing before editing

**CSS layering.** Everything from the layout primitives down lives in `@layer components`. Left unlayered it would silently outrank every Tailwind utility in the project. The reduced-motion block is deliberately left outside the layer so it wins over everything.

**Font sizes.** Use `text-step-xs … text-step-xl`. Do **not** use `text-[var(--step-1)]` — Tailwind can't tell whether a bare `var()` in `text-[…]` is a colour or a length and emits nothing at all.

**Masked reveals.** The CSS start state is a percentage transform, which GSAP resolves into `y` as pixels. Any tween off that state must declare both `yPercent` *and* `y: 0`, or the two stack and the line never leaves its mask.

**Scroll scenes.** All of them go through `useMotion()` in `lib/gsap.ts`, which wraps `gsap.matchMedia`. Each breakpoint gets its own timeline and is reverted on resize, so a pinned desktop scene can't leave transforms behind on a phone. `prefers-reduced-motion` is a branch that *places* content, not a flag that disables animation.

**Dark grounds.** Sections that commit to a dark background regardless of theme carry `.on-dark`, which rebinds the text and accent tokens locally. Without it, descendants keep light-mode `--text-muted` and land around 2:1 on black.

**The opening light→dark resolve.** On the first visit of a session the site arrives in light mode and crossfades to dark as the loader clears. It is stamped in the blocking head script, because the light frame has to be correct on the very first paint or the beat is just a flash of the wrong colour. It never writes to `localStorage` — it's a presentation choice, not the visitor's — so the toggle behaves normally afterwards, an explicit stored preference always wins, and reduced-motion users skip it entirely.

**Intro coordination.** The hero's entry is gated on `IntroProvider`'s `ready` flag, not a window event — an event channel had a race where any path that skipped the loader left the hero waiting forever with its headline still inside the mask.

## Routes

`/` · `/services` · `/services/{web-development,ai-automation,software-development,ui-ux}` · `/about` · `/contact` · 404

Plus `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, and Organization / WebSite / Service JSON-LD.
