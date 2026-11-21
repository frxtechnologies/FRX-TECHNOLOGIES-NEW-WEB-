"use client";

import { useMemo, useState } from "react";
import type { ProjectView } from "@/lib/content/server";
import { ProjectCard } from "./project-card";
import { RevealGrid } from "./reveal-grid";

/**
 * The full portfolio: category filter chips over the same even grid as the homepage. Filtering is
 * instant and keyboard accessible (the chips are a pressed-state button group). Only published
 * projects are ever passed in, and every one of them is shown under "All".
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
      <RevealGrid className="fxw-grid">
        {shown.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </RevealGrid>
      <p className="fxw-live fx-label" aria-live="polite">
        Showing {shown.length} of {projects.length} {projects.length === 1 ? "project" : "projects"}
      </p>
    </div>
  );
}
