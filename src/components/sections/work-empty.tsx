import Link from "next/link";
import { BotBuddy, BlockStack } from "@/components/art/characters";
import { PhoneBuddy, LaptopBuddy } from "@/components/art/scenes";

/**
 * Shown until real projects are published. It states plainly that the work is
 * still to come and shows what FRX is ready to build — it never implies
 * finished client work.
 */
export function WorkEmpty() {
  return (
    <div className="fxw-empty">
      <div className="fxw-empty-copy">
        <p className="fx-label">Work in progress</p>
        <h3 className="fx-d2 fx-up">First projects coming soon.</h3>
        <p className="fx-lead">
          FRX Technologies was founded in 2026. Finished projects will be featured here as they
          launch. Until then, this is what we are ready to build for you.
        </p>
        <Link href="/contact" className="fx-btn fx-hover-shift">
          Start a project <span className="fx-shift" aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="fxw-empty-art" aria-hidden="true">
        <LaptopBuddy className="fxw-e fxw-e--a" />
        <PhoneBuddy className="fxw-e fxw-e--b" />
        <BotBuddy className="fxw-e fxw-e--c" />
        <BlockStack className="fxw-e fxw-e--d" />
      </div>
    </div>
  );
}
