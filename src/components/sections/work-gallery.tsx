"use client";

import { useMemo, useState } from "react";
import type { ProjectView } from "@/lib/content/server";
import { ProjectCard } from "./project-card";

/**
 * The full portfolio: category filter chips over an asymmetric grid. Filtering
 * is instant and keyboard accessible (the chips are a pressed-state button
 * group). Only published projects are ever passed in.
 */
export function WorkGallery({ projects }: { projects: ProjectView[] }) {
  const cats = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [projects]);
  const [cat, setCat] = useState<string>("All");
  const shown = cat === "All" ? projects : projects.filter((p) => p.category === cat);

  return (
    <div>
      {cats.length > 1 && (
        <div className="fxw-filter" role="group" aria-label="Filter projects by category">
          {["All", ...cats].map((c) => (
            <button key={c} type="button" className="fxw-chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="fxw-grid">
        {shown.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} describe reveal={false} />
        ))}
      </div>
    </div>
  );
}
