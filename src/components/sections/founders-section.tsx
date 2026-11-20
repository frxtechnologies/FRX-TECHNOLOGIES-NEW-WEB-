import Image from "next/image";
import type { PublicFounder } from "@/lib/content/types";
import { Sparkle, Squiggle } from "@/components/art/characters";

const initials = (n: string) =>
  n
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

/**
 * "Meet the founders." Two equal portraits set against giant outlined initials,
 * each entering from its own side. Names, roles and portraits come from the
 * existing Supabase `founders` table (admin → Founders). A founder without a
 * portrait gets a designed monogram panel of identical size and weight, so the
 * pair stays balanced and nothing is ever a broken image.
 */
export function FoundersSection({ founders, compact = false }: { founders: PublicFounder[]; compact?: boolean }) {
  return (
    <section className={`fxf ${compact ? "fxf--compact" : ""}`} id="founders" aria-labelledby="fxf-title">
      <div className="fx-container">
        <header className="fxf-head">
          <h2 id="fxf-title" className="fxf-h fx-d1 fx-up" data-fx="reveal-lines">
            Meet the founders.
          </h2>
          <Squiggle className="fxf-squig" />
        </header>

        <div className="fxf-grid">
          {founders.map((f, idx) => (
            <article key={f.name} className="fxf-card" data-fx="fade-up" data-fx-delay={idx * 0.12}>
              <div className="fxf-figure" data-tone={idx % 2 ? "blue" : "tint"}>
                <span className="fxf-ghost fx-outline fx-outline--lg" aria-hidden="true">
                  {initials(f.name)}
                </span>
                <div className="fxf-photo" data-fx="image-reveal">
                  <div className="fxf-photo-in">
                    {f.imageUrl ? (
                      <Image
                        src={f.imageUrl}
                        alt={`Portrait of ${f.name}, ${f.role}`}
                        fill
                        sizes="(max-width: 800px) 90vw, 40vw"
                        className="fxf-img"
                      />
                    ) : (
                      <span className="fxf-mono fx-up" aria-hidden="true">
                        {initials(f.name)}
                      </span>
                    )}
                  </div>
                </div>
                <Sparkle className="fxf-spark" />
              </div>
              <div className="fxf-meta">
                <h3 className="fxf-name fx-d3 fx-up">{f.name}</h3>
                <p className="fx-label fxf-role">{f.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
