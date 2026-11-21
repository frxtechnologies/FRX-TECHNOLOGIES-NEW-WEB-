import Link from "next/link";
import type { ProjectView } from "@/lib/content/server";
import { ProjectCard } from "./project-card";
import { RevealGrid } from "./reveal-grid";
import { WorkEmpty } from "./work-empty";

/**
 * Homepage "Selected work": EVERY published project, in the admin's order, in one even grid
 * (see work.css) — a project added in admin appears here automatically with the same card.
 * Or an honest empty state when there is nothing to show yet.
 */
export function SelectedWork({ projects }: { projects: ProjectView[] }) {
  return (
    <section className="fxw" data-glow id="work" aria-labelledby="fxw-title">
      <div className="fx-container">
        <header className="fxw-head">
          <div>
            <h2 id="fxw-title" className="fxw-h fx-d1 fx-up" data-fx="reveal-lines">
              Selected work
            </h2>
            {projects.length ? (
              <p className="fxw-count fx-label fx-tabular">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </p>
            ) : null}
          </div>
          <Link href="/work" className="fx-btn fx-btn--outline fx-hover-shift">
            View all work <span className="fx-shift" aria-hidden="true">→</span>
          </Link>
        </header>

        {projects.length ? (
          <RevealGrid className="fxw-grid">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </RevealGrid>
        ) : (
          <WorkEmpty />
        )}
      </div>
    </section>
  );
}
