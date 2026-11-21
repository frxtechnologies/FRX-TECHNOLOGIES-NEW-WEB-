"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SIZES = "(min-width: 1500px) 24vw, (min-width: 1000px) 32vw, (min-width: 640px) 48vw, 94vw";

/**
 * The picture inside a project card's fixed-ratio box.
 *
 *  - The WHOLE image is always visible (`object-fit: scale-down` = contain, but never enlarged past its
 *    real pixel size), centred in the box. Nothing important is ever cropped away and a small image is
 *    never stretched into blur.
 *  - Behind it sits a heavily blurred, dimmed copy of the same image, so letterbox bars read as a
 *    deliberate backdrop in any theme instead of an empty or black block. It is the same optimised URL as
 *    the foreground, so the browser fetches it once.
 *  - `images` is this project's own list (cover first, then its gallery). If one fails to load, the next
 *    is tried; when none remain, a branded title poster is shown. Never another project's image.
 */
export function ProjectImage({ images, alt, title }: { images: string[]; alt: string; title: string }) {
  const [i, setI] = useState(0);
  const fg = useRef<HTMLImageElement>(null);
  const src = images[i];
  const direct = !!src?.startsWith("/api/"); // /api/cutout output: already processed and cached

  // An image can fail BEFORE React hydrates, in which case onError never fires. Check once mounted.
  useEffect(() => {
    const el = fg.current;
    if (el && el.complete && el.naturalWidth === 0) setI((n) => n + 1);
  }, [i]);

  if (!src) {
    return (
      <span className="fxw-poster" aria-hidden="true">
        <span>{title}</span>
      </span>
    );
  }

  return (
    <>
      {/* decorative: only the main picture reports a failure, otherwise one broken file would skip two images */}
      <Image src={src} alt="" fill sizes={SIZES} quality={80} unoptimized={direct} className="fxw-back" aria-hidden="true" />
      <Image
        ref={fg}
        key={src}
        src={src}
        alt={alt}
        fill
        sizes={SIZES}
        quality={80}
        unoptimized={direct}
        className="fxw-fg"
        onError={() => setI((n) => n + 1)}
      />
    </>
  );
}
