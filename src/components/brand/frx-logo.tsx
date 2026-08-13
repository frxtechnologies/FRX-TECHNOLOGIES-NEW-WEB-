import Image from "next/image";

/** Intrinsic dimensions of the official lockup artwork. */
const LOCKUP = { w: 1101, h: 477 };
const MARK = { w: 386, h: 302 };

type Props = {
  className?: string;
  priority?: boolean;
  /** Rendered width hint for srcset selection. */
  sizes?: string;
};

/**
 * The official FRX Technologies lockup.
 *
 * Both files are the same artwork: `light-mode` is the supplied original, and
 * `dark-mode` recolours only the navy letterforms to white — the blue X and the
 * blue rules are untouched. Both are rendered and swapped with CSS rather than
 * with a JS theme read, so the correct one is present on the very first paint.
 *
 * Aspect ratio comes from the intrinsic dimensions and is never overridden.
 */
export function FrxLogo({ className = "", priority, sizes = "320px" }: Props) {
  return (
    <span
      className={`frx-logo relative block ${className}`}
      style={{ aspectRatio: `${LOCKUP.w} / ${LOCKUP.h}` }}
      role="img"
      aria-label="FRX Technologies"
    >
      <Image
        src="/brand/frx-logo-light-mode.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="frx-logo-light object-contain"
      />
      <Image
        src="/brand/frx-logo-dark-mode.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="frx-logo-dark object-contain"
      />
    </span>
  );
}

/** The X on its own — for tight UI where the full lockup would be unreadable. */
export function FrxMark({ className = "", sizes = "48px" }: Props) {
  return (
    <span
      className={`relative block ${className}`}
      style={{ aspectRatio: `${MARK.w} / ${MARK.h}` }}
      aria-hidden="true"
    >
      <Image src="/brand/frx-x.png" alt="" fill sizes={sizes} className="object-contain" />
    </span>
  );
}
