import { readDs, readTokens, contrast } from "./reader";
import { Shell } from "./shell";
import { DurationDemo, TypeScale, WipeDemo, type ScaleRow } from "./parts";

const SCALE: ScaleRow[] = [
  { cls: "fx-mega", token: "--fx-fs-mega", role: "Hero statement (one per page)", face: "Bricolage 800 · 75% wide", clamp: "clamp(4.25rem, 1.6rem + 18.5vw, 21rem)", lh: "0.80", ls: "-0.008em", sample: "Build" },
  { cls: "fx-d1", token: "--fx-fs-d1", role: "Section opener", face: "Bricolage 800 · 75% wide", clamp: "clamp(3.5rem, 1.5rem + 12vw, 14rem)", lh: "0.86", ls: "-0.006em", sample: "Automate" },
  { cls: "fx-d2", token: "--fx-fs-d2", role: "Large editorial heading", face: "Bricolage 800 · 75% wide", clamp: "clamp(2.8rem, 1.3rem + 8vw, 9rem)", lh: "0.86", ls: "-0.006em", sample: "Scale up" },
  { cls: "fx-d3", token: "--fx-fs-d3", role: "Display subhead", face: "Bricolage 800 · 75% wide", clamp: "clamp(2.3rem, 1.2rem + 5vw, 6rem)", lh: "0.86", ls: "-0.006em", sample: "Software that works" },
  { cls: "fx-h1", token: "--fx-fs-h1", role: "Page heading", face: "Bricolage 700 · 87% wide", clamp: "clamp(2rem, 1.2rem + 3.4vw, 4.25rem)", lh: "1.00", ls: "-0.012em", sample: "Systems built to last" },
  { cls: "fx-h2", token: "--fx-fs-h2", role: "Section heading", face: "Bricolage 700 · 87% wide", clamp: "clamp(1.65rem, 1.1rem + 2.2vw, 3rem)", lh: "1.00", ls: "-0.012em", sample: "What we build for you" },
  { cls: "fx-h3", token: "--fx-fs-h3", role: "Card / block heading", face: "Bricolage 700 · 87% wide", clamp: "clamp(1.3rem, 1rem + 1.1vw, 1.9rem)", lh: "1.15", ls: "-0.012em", sample: "Custom software and automation" },
  { cls: "fx-h4", token: "--fx-fs-h4", role: "Small heading", face: "Bricolage 600 · 100% wide", clamp: "clamp(1.1rem, 1rem + 0.45vw, 1.35rem)", lh: "1.30", ls: "-0.012em", sample: "Discovery and scoping" },
  { cls: "fx-lead", token: "--fx-fs-lead", role: "Intro paragraph", face: "Inter Tight 400", clamp: "clamp(1.15rem, 1rem + 0.6vw, 1.6rem)", lh: "1.30", ls: "-0.014em", sample: "We design and ship software that removes work instead of adding it." },
  { cls: "fx-body", token: "--fx-fs-body", role: "Paragraph", face: "Inter Tight 400", clamp: "clamp(1rem, 0.95rem + 0.2vw, 1.1875rem)", lh: "1.55", ls: "-0.006em", sample: "Body copy stays quiet so the display type can be loud. Measure is held near 62 characters for comfortable reading." },
  { cls: "fx-small", token: "--fx-fs-small", role: "Captions, helper text", face: "Inter Tight 400", clamp: "0.9375rem", lh: "1.55", ls: "0", sample: "Secondary information and helper text." },
  { cls: "fx-label", token: "--fx-fs-label", role: "Eyebrows, buttons, tags", face: "Inter Tight 600 · uppercase", clamp: "0.75rem", lh: "1.4", ls: "0.14em", sample: "Services · Process · Contact" },
  { cls: "fx-micro", token: "--fx-fs-micro", role: "Legal, meta", face: "Inter Tight 400", clamp: "0.6875rem", lh: "1.4", ls: "0.02em", sample: "© FRX Technologies — all rights reserved" },
];

const SPACES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const SPACE_PX = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192];

const SWATCH_KEYS = [
  "--fx-bg",
  "--fx-bg-2",
  "--fx-surface",
  "--fx-ink",
  "--fx-ink-2",
  "--fx-ink-3",
  "--fx-accent",
  "--fx-accent-text",
  "--fx-accent-tint",
] as const;

function Palette({ mode, tokens }: { mode: "light" | "dark"; tokens: Record<string, string> }) {
  const bg = tokens["--fx-bg"];
  return (
    <div className="fx-root sc-pal" data-fx-theme={mode} style={{ background: "var(--fx-bg)", color: "var(--fx-ink)" }}>
      <h3 className="fx-h3">{mode === "light" ? "Light — default" : "Dark — toggle"}</h3>
      <div className="sc-swatches">
        {SWATCH_KEYS.map((k) => {
          const v = tokens[k];
          const ratio = contrast(v, bg);
          return (
            <div className="sc-swatch" key={k}>
              <div className="sc-chip" style={{ background: `var(${k})` }} />
              <p className="fx-label">{k.replace("--fx-", "")}</p>
              <p className="fx-micro fx-faint fx-tabular">
                {v}
                {ratio && k !== "--fx-bg" ? ` · ${ratio.toFixed(2)}:1 on bg` : ""}
              </p>
            </div>
          );
        })}
        <div className="sc-swatch">
          <div className="sc-chip" style={{ background: "var(--fx-blue)" }} />
          <p className="fx-label">blue (fills)</p>
          <p className="fx-micro fx-faint fx-tabular">
            {tokens["--fx-blue"]} · {contrast(tokens["--fx-blue"], bg)?.toFixed(2)}:1 on bg
          </p>
        </div>
      </div>
    </div>
  );
}

const OUTLINE_TONES = [
  ["sc-tone-paper", "On page ground"],
  ["sc-tone-blue", "On blue"],
  ["sc-tone-black", "On black"],
] as const;

export default function DesignSystemPage() {
  const { light, dark } = readTokens();
  const tokensCss = readDs("tokens.css");
  const typeCss = readDs("type.css");
  const fxCss = readDs("motion/fx.css");

  return (
    <Shell>
      <main id="top">
        {/* 1 ── specimen ───────────────────────────────────────────────── */}
        <section className="fx-container sc-hero" id="type">
          <p className="fx-label fx-accent">01 · Specimen · Bricolage Grotesque + Inter Tight</p>
          <h1 className="fx-mega fx-up" data-fx="reveal-lines" data-fx-trigger="load">
            Build.<br />Automate.<br />Scale.
          </h1>
          <div className="sc-grid sc-grid-2">
            <div className="fx-stack">
              <h2 className="fx-h1">Software that quietly removes work.</h2>
              <p className="fx-lead fx-muted fx-measure">
                Bricolage carries the voice — oversized, condensed, editorial. Inter Tight does the
                work: paragraphs, navigation, buttons, forms and the admin panel.
              </p>
              <div className="sc-row">
                <a className="fx-btn fx-hover-shift" href="#motion">
                  Start a project <span className="fx-shift" aria-hidden="true">→</span>
                </a>
                <a className="fx-btn fx-btn--outline fx-hover-shift" href="#scale">
                  View the scale <span className="fx-shift" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="fx-stack">
              <nav className="sc-row" aria-label="Nav specimen">
                {["Services", "Work", "Process", "About", "Contact"].map((x) => (
                  <a key={x} href="#top" className="fx-nav fx-link">
                    {x}
                  </a>
                ))}
              </nav>
              <p className="fx-body fx-measure">
                Body copy at the base size, <strong className="fx-w-semibold">semibold emphasis</strong>,{" "}
                <span className="fx-faint">and a quieter secondary tone</span>. Numerals stay tidy:{" "}
                <span className="fx-tabular">0123456789</span>.
              </p>
              <label className="sc-field">
                <span className="fx-label">Your email</span>
                <input className="sc-input" type="email" placeholder="name@company.com" />
              </label>
            </div>
          </div>

          <hr className="fx-rule" style={{ marginBlock: "var(--fx-space-7)" }} />

          <p className="fx-label fx-faint" style={{ marginBlockEnd: "var(--fx-space-4)" }}>
            Weight ladder · Bricolage 200–800 (variable axis)
          </p>
          <div className="sc-weights">
            {[
              ["hairline", 200],
              ["light", 300],
              ["regular", 400],
              ["medium", 500],
              ["semibold", 600],
              ["bold", 700],
              ["black", 800],
            ].map(([n, w]) => (
              <div key={n}>
                <p className="fx-d3 fx-up" style={{ fontWeight: Number(w), fontStretch: "87%" }}>
                  Frx
                </p>
                <p className="fx-micro fx-faint">
                  {n} · {w}
                </p>
              </div>
            ))}
          </div>

          <p className="fx-label fx-faint" style={{ marginBlock: "var(--fx-space-7) var(--fx-space-4)" }}>
            Width ladder · Bricolage 75–100% (variable axis)
          </p>
          <div className="sc-widths">
            {[
              ["Condensed", "75%"],
              ["Narrow", "87%"],
              ["Normal", "100%"],
            ].map(([n, w]) => (
              <div key={n}>
                <p className="fx-d2 fx-up" style={{ fontStretch: w }}>
                  Scale
                </p>
                <p className="fx-micro fx-faint">
                  {n} · {w}
                </p>
              </div>
            ))}
          </div>

          <p className="fx-label fx-faint" style={{ marginBlock: "var(--fx-space-7) var(--fx-space-4)" }}>
            Mixed editorial line · selected large words
          </p>
          <p className="sc-words fx-d3">
            <span>We</span>
            <span className="fx-accent fx-up fx-w-black">build</span>
            <span>the</span>
            <span className="fx-up">tools</span>
            <span>your</span>
            <span className="fx-accent fx-up fx-w-black">business</span>
            <span>runs on.</span>
          </p>
        </section>

        {/* 2 ── outline study ──────────────────────────────────────────── */}
        <section className="fx-section-tight fx-container" id="outline">
          <div className="sc-head">
            <span className="fx-label sc-num">02</span>
            <h2 className="fx-d3 fx-up">Outline study</h2>
          </div>
          <p className="fx-body fx-muted sc-sub">
            Raw <code>-webkit-text-stroke</code> shows the font&apos;s overlapping internal contours on
            a variable font. Four replacements, each on paper, blue and black, at display and small sizes.
          </p>
          <div className="sc-grid sc-grid-2">
            {OUTLINE_TONES.map(([tone, label]) => (
              <div key={tone} className={`sc-outline-card ${tone}`}>
                <p className="fx-label">{label}</p>
                {(
                  [
                    ["1 · raw -webkit-text-stroke (broken baseline)", "sc-o-raw", "sc-o-raw"],
                    ["2 · paint-order: stroke fill", "sc-o-paint", "sc-o-paint"],
                    ["3 · 16-direction text-shadow ring", "sc-o-shadow", "sc-o-shadow"],
                    ["4 · SVG morphology ring — SELECTED (.fx-outline)", "fx-outline fx-outline--lg", "fx-outline fx-outline--sm"],
                  ] as const
                ).map(([name, big, small]) => (
                  <div key={name}>
                    <p className="fx-micro" style={{ opacity: 0.7 }}>{name}</p>
                    <p className={`fx-d1 fx-up sc-outline-big ${big}`}>Frx</p>
                    <p className={`fx-d3 fx-up sc-outline-small ${small}`}>
                      Build automate
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* 3 ── colour ─────────────────────────────────────────────────── */}
        <section className="fx-section-tight fx-container" id="colour">
          <div className="sc-head">
            <span className="fx-label sc-num">03</span>
            <h2 className="fx-d3 fx-up">Colour</h2>
          </div>
          <p className="fx-body fx-muted sc-sub">
            One accent. FRX blue is the only chroma; everything else is paper and ink. Values below are
            parsed from <code>tokens.css</code> at render time. Blue is for fills and large text — small
            text on dark uses <code>accent-text</code>.
          </p>
          <div className="sc-grid sc-grid-2">
            <Palette mode="light" tokens={light} />
            <Palette mode="dark" tokens={dark} />
          </div>
        </section>

        {/* 4 ── scale ──────────────────────────────────────────────────── */}
        <section className="fx-section-tight fx-container" id="scale">
          <div className="sc-head">
            <span className="fx-label sc-num">04</span>
            <h2 className="fx-d3 fx-up">Type scale</h2>
          </div>
          <p className="fx-body fx-muted sc-sub">
            Fluid <code>clamp()</code> sizes — the live pixel value is measured from the rendered node
            and updates as you resize.
          </p>
          <TypeScale rows={SCALE} />
        </section>

        {/* 5 ── space + layout ─────────────────────────────────────────── */}
        <section className="fx-section-tight fx-container" id="space">
          <div className="sc-head">
            <span className="fx-label sc-num">05</span>
            <h2 className="fx-d3 fx-up">Spacing and layout</h2>
          </div>

          <div className="sc-grid sc-grid-2">
            <div>
              <h3 className="fx-h4" style={{ marginBlockEnd: "var(--fx-space-4)" }}>Space scale · 4px base</h3>
              <div className="sc-bars">
                {SPACES.map((n, i) => (
                  <div className="sc-bar-row" key={n}>
                    <span className="fx-micro fx-tabular">space-{n} · {SPACE_PX[i]}px</span>
                    <i className="sc-bar-fill" style={{ inlineSize: `var(--fx-space-${n})` }} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="fx-h4" style={{ marginBlockEnd: "var(--fx-space-4)" }}>Layout tokens</h3>
              <table className="sc-table">
                <tbody>
                  {[
                    ["gutter", "clamp(1.25rem, 0.5rem + 3vw, 4.5rem)", "--fx-gutter"],
                    ["section-y", "clamp(5rem, 2.5rem + 10vw, 12rem)", "--fx-section-y"],
                    ["section-y-tight", "clamp(3rem, 1.5rem + 6vw, 7rem)", "--fx-section-y-tight"],
                    ["stack", "clamp(1.25rem, 0.8rem + 1.6vw, 2.5rem)", "--fx-stack"],
                    ["w-prose", "38rem (~62ch)", "--fx-w-prose"],
                    ["w-narrow", "46rem", "--fx-w-narrow"],
                    ["w-content", "75rem", "--fx-w-content"],
                    ["w-wide", "97.5rem", "--fx-w-wide"],
                  ].map(([n, v, t]) => (
                    <tr key={n}>
                      <th scope="row">{n}</th>
                      <td className="fx-tabular">{v}</td>
                      <td className="fx-faint">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="fx-h4" style={{ marginBlock: "var(--fx-space-8) var(--fx-space-4)" }}>
            Radii · borders · shadows
          </h3>
          <div className="sc-shapes">
            {[
              ["radius-0", "0", "var(--fx-radius-0)", "none"],
              ["radius-1", "2px", "var(--fx-radius-1)", "none"],
              ["radius-2", "4px · buttons", "var(--fx-radius-2)", "none"],
              ["radius-3", "8px · cards", "var(--fx-radius-3)", "none"],
              ["radius-4", "14px", "var(--fx-radius-4)", "none"],
              ["radius-pill", "999px", "var(--fx-radius-pill)", "none"],
              ["shadow-sm", "", "var(--fx-radius-3)", "var(--fx-shadow-sm)"],
              ["shadow-md", "", "var(--fx-radius-3)", "var(--fx-shadow-md)"],
              ["shadow-lg", "", "var(--fx-radius-3)", "var(--fx-shadow-lg)"],
              ["shadow-accent", "", "var(--fx-radius-3)", "var(--fx-shadow-accent)"],
            ].map(([n, d, r, s]) => (
              <div className="sc-shape" key={n}>
                <i style={{ borderRadius: r, boxShadow: s }} />
                <span className="fx-micro fx-tabular">
                  {n}
                  {d ? ` · ${d}` : ""}
                </span>
              </div>
            ))}
          </div>

          <h3 className="fx-h4" style={{ marginBlock: "var(--fx-space-8) var(--fx-space-4)" }}>Breakpoints</h3>
          <table className="sc-table">
            <tbody>
              {[
                ["sm", "640px", "large phones"],
                ["md", "768px", "tablet portrait — pin/horizontal still native"],
                ["lg", "1024px", "desktop begins — pinned and horizontal motion on"],
                ["xl", "1280px", "wide desktop"],
                ["2xl", "1536px", "extra wide, container caps at 97.5rem"],
              ].map(([n, v, d]) => (
                <tr key={n}>
                  <th scope="row">{n}</th>
                  <td className="fx-tabular">{v}</td>
                  <td className="fx-faint">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 6 ── motion ─────────────────────────────────────────────────── */}
        <section id="motion" className="fx-container" style={{ paddingBlockStart: "var(--fx-section-y-tight)" }}>
          <div className="sc-head">
            <span className="fx-label sc-num">06</span>
            <h2 className="fx-d3 fx-up">Motion conventions</h2>
          </div>
          <p className="fx-body fx-muted sc-sub">
            GSAP + ScrollTrigger + Lenis only. Mark up with <code>data-fx</code>, call <code>useFx(ref)</code> once.
            Reduced-motion users get every element in its final state.
          </p>

          <div className="sc-demo">
            <p className="fx-label sc-demo-tag">reveal-lines · reveal-words · reveal-chars</p>
            <h3 className="fx-d2 fx-up" data-fx="reveal-lines">
              Lines rise through a mask
            </h3>
            <h3 className="fx-d3 fx-up" data-fx="reveal-words" style={{ marginBlockStart: "var(--fx-space-6)" }}>
              Words arrive one after another
            </h3>
            <h3 className="fx-d3 fx-up fx-accent" data-fx="reveal-chars" style={{ marginBlockStart: "var(--fx-space-6)" }}>
              Characters for big moments
            </h3>
          </div>

          <div className="sc-demo">
            <p className="fx-label sc-demo-tag">fade-up · image-reveal (up / left / right)</p>
            <div className="sc-grid sc-grid-3">
              <p className="fx-lead" data-fx="fade-up">
                Blocks fade and rise 24px.
              </p>
              {(["up", "left", "right"] as const).map((d) => (
                <div key={d} data-fx="image-reveal" data-fx-dir={d}>
                  <div className="sc-art">
                    <span className="fx-d1 fx-up">FRX</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sc-demo">
            <p className="fx-label sc-demo-tag">parallax · data-fx-speed (desktop and tablet)</p>
            <div className="sc-parallax">
              <div data-fx="parallax" data-fx-speed="0.2">
                <span className="p-back fx-mega fx-up">Scale</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="sc-band"
          data-fx="color-scroll"
          data-fx-from-bg="var(--fx-bg)"
          data-fx-bg="var(--fx-blue)"
          data-fx-ink="#ffffff"
        >
          <div className="fx-container">
            <p className="fx-label">color-scroll · paper → blue</p>
            <p className="fx-d1 fx-up">The ground changes as you scroll.</p>
          </div>
        </section>
        <section
          className="sc-band"
          data-fx="color-scroll"
          data-fx-from-bg="var(--fx-blue)"
          data-fx-from-ink="#ffffff"
          data-fx-bg="#08090c"
          data-fx-ink="#f4f2ed"
        >
          <div className="fx-container">
            <p className="fx-label">color-scroll · blue → black</p>
            <p className="fx-d1 fx-up">Then deeper still.</p>
          </div>
        </section>

        <section className="sc-pin" data-fx="pin" data-fx-length="300%">
          <div className="fx-container">
            <p className="fx-label">pin · stepped stage (desktop) — stacks on phones</p>
            <div className="sc-pin-steps">
              {["Build.", "Automate.", "Scale."].map((s) => (
                <p key={s} className="fx-mega fx-up" data-fx-step>
                  {s}
                </p>
              ))}
            </div>
            <div className="sc-pin-bar" aria-hidden="true">
              <i />
            </div>
          </div>
        </section>

        <section className="sc-hz" data-fx="horizontal">
          <div className="fx-container">
            <p className="fx-label">horizontal · pinned travel (desktop) — native snap rail otherwise</p>
          </div>
          <div data-fx-track>
            {[
              ["01", "Discover"],
              ["02", "Design"],
              ["03", "Build"],
              ["04", "Ship"],
              ["05", "Support"],
            ].map(([n, t]) => (
              <article className="sc-hz-card" key={n}>
                <p className="fx-label">{n}</p>
                <h3 className="fx-d3 fx-up">{t}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="fx-container">
          <div className="sc-demo">
            <p className="fx-label sc-demo-tag">hover · fine pointers only</p>
            <div className="sc-grid sc-grid-3">
              <div className="sc-card-lift fx-hover-lift">
                <p className="fx-h4">fx-hover-lift</p>
                <p className="fx-small fx-muted">Rises 6px, gains a shadow.</p>
              </div>
              <div className="fx-hover-zoom">
                <div className="sc-art" style={{ blockSize: "10rem" }}>
                  <span className="fx-d2 fx-up">Zoom</span>
                </div>
              </div>
              <a className="sc-card-lift fx-hover-shift" href="#motion">
                <p className="fx-h4">
                  fx-hover-shift <span className="fx-shift" aria-hidden="true">→</span>
                </p>
                <p className="fx-small fx-muted">
                  Arrow nudges. <span className="fx-link">Underline wipes in.</span>
                </p>
              </a>
            </div>
          </div>

          <div className="sc-demo">
            <p className="fx-label sc-demo-tag">durations and easing</p>
            <DurationDemo />
          </div>

          <div className="sc-demo">
            <p className="fx-label sc-demo-tag">page transition · fxWipe</p>
            <WipeDemo />
          </div>
        </section>

        {/* 7 ── code ───────────────────────────────────────────────────── */}
        <section className="fx-section-tight fx-container" id="code">
          <div className="sc-head">
            <span className="fx-label sc-num">07</span>
            <h2 className="fx-d3 fx-up">Tokens and utilities</h2>
          </div>
          {[
            ["tokens.css — all design tokens", tokensCss],
            ["type.css — typography and layout utilities", typeCss],
            ["motion/fx.css — motion baselines", fxCss],
          ].map(([name, body]) => (
            <details className="sc-code" key={name}>
              <summary className="fx-h4">{name}</summary>
              <pre>{body}</pre>
            </details>
          ))}
        </section>
      </main>
    </Shell>
  );
}
