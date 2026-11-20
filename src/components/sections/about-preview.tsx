import Link from "next/link";
import { ScrollWords } from "@/components/motion/scroll-words";
import { Squiggle } from "@/components/art/characters";

/**
 * "A bit about us" — a large editorial paragraph that turns from neutral to FRX
 * blue word by word as it scrolls through. The copy is editable
 * (admin → Pages → About, "Homepage preview"). The button opens the real
 * About page.
 */
export function AboutPreview({ text }: { text: string }) {
  return (
    <section className="fxa" data-glow id="about-preview" aria-labelledby="fxa-title">
      <div className="fx-container fxa-wrap">
        <div className="fxa-head">
          <p className="fx-label fxa-eyebrow">
            <span className="fxa-tick" aria-hidden="true" />
            Who we are
          </p>
          <h2 id="fxa-title" className="fxa-title fx-d1 fx-up" data-fx="reveal-lines">
            A bit about us
          </h2>
          <Squiggle className="fxa-squig" />
        </div>

        <ScrollWords as="p" className="fxa-text fx-h1" text={text} />

        <div className="fxa-cta" data-fx="fade-up">
          <Link href="/about" className="fx-btn fx-btn--ink fx-hover-shift fxa-btn">
            View full about us <span className="fx-shift" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
