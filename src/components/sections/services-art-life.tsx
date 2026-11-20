"use client";

import { useRef, type ReactNode } from "react";
import { useArtLife } from "@/components/motion/use-art-life";

/** Client wrapper that animates every illustration inside a server-rendered subtree. */
export function ServicesArtLife({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useArtLife(ref);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
