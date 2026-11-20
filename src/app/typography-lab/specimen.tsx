import type { CSSProperties } from "react";
import { FrxLogo } from "@/components/brand/frx-logo";
import { CREDITS, type Concept } from "./concepts";

const NAV = ["Work", "Services", "About", "Contact"];

const TICKER = [
  "Build. Automate. Scale.",
  "We make technology work harder",
  "Custom software",
  "Intelligent automation",
  "Digital experiences",
];

/**
 * One specimen = the real FRX content set in one font pairing. Identical
 * markup for every concept; the concept only supplies CSS variables.
 */
export function Specimen({ concept }: { concept: Concept }) {
  const style = concept.vars as CSSProperties;

  return (
    <article className="tl-spec" style={style} data-concept={concept.key}>
      {/* ---- navigation + buttons -------------------------------------- */}
      <header className="tl-nav">
        <a className="tl-nav-logo" href="#" aria-label="FRX Technologies">
          <FrxLogo sizes="140px" />
        </a>
        <nav className="tl-nav-links" aria-label="Sample navigation">
          {NAV.map((n) => (
            <a key={n} href="#" className="tl-pill-link">
              {n}
            </a>
          ))}
        </nav>
        <a href="#" className="tl-btn tl-btn-blue">
          Let&apos;s talk
          <span aria-hidden="true" className="tl-btn-arrow">↗</span>
        </a>
      </header>

      {/* ---- hero ------------------------------------------------------- */}
      <section className="tl-hero">
        <p className="tl-eyebrow">Founded 2026 · Software · Automation · Digital</p>
        <h1 className="tl-hero-title" aria-label="Build. Automate. Scale.">
          <span className="tl-line">Build.</span>
          <span className="tl-line">Automate.</span>
          <span className="tl-line tl-blue">Scale.</span>
        </h1>
        <span className="tl-tag tl-tag-1" aria-hidden="true">Custom software</span>
        <span className="tl-tag tl-tag-2" aria-hidden="true">Intelligent automation</span>
        <span className="tl-tag tl-tag-3" aria-hidden="true">Digital experiences</span>
      </section>

      <section className="tl-intro">
        <h2 className="tl-support">We make technology work harder.</h2>
        <div className="tl-intro-copy">
          <p className="tl-body-lg">
            FRX Technologies builds custom software, intelligent automation and digital
            experiences that help businesses move forward.
          </p>
          <div className="tl-btn-row">
            <a href="#" className="tl-btn tl-btn-black">
              Start a project
              <span aria-hidden="true" className="tl-btn-arrow">↗</span>
            </a>
            <a href="#" className="tl-btn tl-btn-outline">
              See what we build
            </a>
          </div>
        </div>
      </section>

      {/* ---- ticker ------------------------------------------------------ */}
      <div className="tl-ticker" aria-hidden="true">
        <div className="tl-ticker-track">
          {[0, 1].map((copy) => (
            <div className="tl-ticker-set" key={copy}>
              {TICKER.map((t) => (
                <span key={t} className="tl-ticker-item">
                  {t}
                  <i className="tl-ticker-star">✱</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---- editorial section ------------------------------------------ */}
      <section className="tl-editorial">
        <p className="tl-eyebrow">What we do</p>
        <h2 className="tl-editorial-title">
          Systems built around <span className="tl-outline">how you</span>{" "}
          <span className="tl-blue">actually</span> work.
        </h2>
        <div className="tl-editorial-cols">
          <p className="tl-body">
            FRX designs software, AI systems and digital experiences around real business
            requirements — turning complex workflows into technology that is practical,
            scalable and easier to operate.
          </p>
          <p className="tl-body tl-body-sm">
            Smaller paragraph, set at body size. Technology should remove friction, not
            create more of it. We build around the problem, keep systems useful, design
            intentionally, automate intelligently and engineer for growth.
          </p>
          <p className="tl-statement">Build smarter. Launch faster. Grow further.</p>
        </div>
      </section>

      {/* ---- large individual words ------------------------------------- */}
      <section className="tl-words" aria-label="Display words at different sizes and weights">
        <span className="tl-word tl-word-1" style={{ fontWeight: concept.weights[concept.weights.length - 1] }}>
          Web
        </span>
        <span className="tl-word tl-word-2 tl-blue" style={{ fontWeight: concept.weights[Math.floor(concept.weights.length / 2)] }}>
          Apps
        </span>
        <span className="tl-word tl-word-3 tl-outline">AI</span>
        <span className="tl-word tl-word-4" style={{ fontWeight: concept.weights[0] }}>
          Automation
        </span>
        <span className="tl-word tl-word-5 tl-blue-bg">UI/UX</span>
      </section>

      {/* ---- size ladder -------------------------------------------------- */}
      <section className="tl-ladder">
        <p className="tl-eyebrow">Size ladder</p>
        {[120, 80, 52, 34, 22].map((px) => (
          <div className="tl-ladder-row" key={px}>
            <span className="tl-ladder-size">{px}px</span>
            <span className="tl-ladder-text" style={{ fontSize: `clamp(${Math.max(16, Math.round(px * 0.3))}px, ${(px / 14.4).toFixed(2)}vw, ${px}px)` }}>
              We make technology work harder.
            </span>
          </div>
        ))}
        <div className="tl-ladder-body">
          {[22, 18, 16, 14].map((px) => (
            <p key={px} style={{ fontSize: px }}>
              <b>{px}px</b> — FRX builds around the problem: custom software, intelligent
              automation and digital experiences, designed intentionally and engineered
              for growth.
            </p>
          ))}
        </div>
      </section>

      {/* ---- axis explorer ------------------------------------------------ */}
      <section className="tl-explorer">
        <p className="tl-eyebrow">{concept.explorerTitle}</p>
        {concept.explorer.map((row) => (
          <div className="tl-explorer-row" key={row.caption}>
            <span className="tl-explorer-cap">{row.caption}</span>
            <span
              className="tl-explorer-text"
              style={{
                fontWeight: row.wght,
                letterSpacing: row.ls,
                fontVariationSettings: `"wdth" ${row.wdth ?? 100}, "opsz" ${row.opsz ?? 0}`,
              }}
            >
              Build. Automate. Scale.
            </span>
          </div>
        ))}
      </section>

      {/* ---- credits ------------------------------------------------------ */}
      <footer className="tl-credits">
        <p className="tl-eyebrow">
          This concept: {concept.displayName} + {concept.bodyName}
        </p>
        <ul>
          {CREDITS.filter(
            (c) => c.name === concept.displayName || c.name === concept.bodyName,
          ).map((c) => (
            <li key={c.name}>
              <b>{c.name}</b> — {c.designer} · SIL Open Font License 1.1 · {c.axes} ·{" "}
              <a href={c.source}>{c.source.replace("https://", "")}</a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
