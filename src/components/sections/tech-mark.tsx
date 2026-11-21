"use client";

import { useEffect, useRef, useState } from "react";

/** Short display marks for the typographic fallback. */
const MARK: Record<string, string> = {
  "Next.js": "N",
  "Node.js": "No",
  "Make.com": "Mk",
  n8n: "n8n",
  TypeScript: "TS",
  JavaScript: "JS",
  GSAP: "GS",
  OpenAI: "AI",
  "Tailwind CSS": "TW",
  PostgreSQL: "PG",
  MongoDB: "Mg",
  Supabase: "Sb",
  Firebase: "Fb",
  WordPress: "WP",
  Shopify: "Sh",
  Flutter: "Fl",
  Python: "Py",
  Gemini: "Gm",
  React: "Re",
};
const mark = (name: string) =>
  MARK[name] ?? name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).replace(/^./, (c) => c.toUpperCase());

/**
 * A technology's logo, sitting on its small light plate. Logos arrive already cleaned
 * (transparent, trimmed) from /api/logo; if one is missing or fails to load, the typographic
 * monogram takes its place so a plate is never empty or broken.
 */
export function TechMark({ logo, name }: { logo: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  // the image may fail before hydration (no onError then): check once mounted
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (!logo || failed) return <span className="fxt-mono">{mark(name)}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={img} src={logo} alt="" loading="lazy" decoding="async" draggable={false} onError={() => setFailed(true)} />
  );
}
