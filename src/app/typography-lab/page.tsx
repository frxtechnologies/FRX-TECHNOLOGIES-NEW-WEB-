import Link from "next/link";
import type { CSSProperties } from "react";
import { CONCEPTS, type ConceptKey } from "./concepts";
import { Specimen } from "./specimen";

type View = ConceptKey | "compare";

const VIEWS: { key: View; label: string; sub: string }[] = [
  { key: "a", label: "A", sub: "Bricolage + Inter Tight" },
  { key: "b", label: "B", sub: "Archivo + Hanken Grotesk" },
  { key: "c", label: "C", sub: "Anton + Inter Tight" },
  { key: "compare", label: "Compare", sub: "same headline, stacked" },
];

export default async function TypographyLabPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const view: View = c === "b" || c === "c" || c === "compare" ? c : "a";

  return (
    <>
      <div className="tl-switcher" role="navigation" aria-label="Typography concepts">
        <span className="tl-switcher-title">Typography lab · temporary</span>
        <div className="tl-switcher-tabs">
          {VIEWS.map((v) => (
            <Link
              key={v.key}
              href={`/typography-lab?c=${v.key}`}
              className="tl-switcher-tab"
              aria-current={view === v.key ? "page" : undefined}
              scroll={false}
            >
              <b>{v.label}</b>
              <small>{v.sub}</small>
            </Link>
          ))}
        </div>
      </div>

      {view === "compare" ? (
        <div className="tl-compare">
          {(["a", "b", "c"] as const).map((k) => {
            const concept = CONCEPTS[k];
            return (
              <section
                key={k}
                className="tl-compare-block"
                style={concept.vars as CSSProperties}
              >
                <p className="tl-eyebrow">
                  {concept.label} · {concept.displayName} + {concept.bodyName}
                </p>
                <h2 className="tl-compare-title">
                  <span>Build.</span> <span>Automate.</span>{" "}
                  <span className="tl-blue">Scale.</span>
                </h2>
                <p className="tl-support">We make technology work harder.</p>
                <p className="tl-body-lg">
                  FRX Technologies builds custom software, intelligent automation and
                  digital experiences that help businesses move forward.
                </p>
              </section>
            );
          })}
        </div>
      ) : (
        <Specimen concept={CONCEPTS[view]} />
      )}
    </>
  );
}
