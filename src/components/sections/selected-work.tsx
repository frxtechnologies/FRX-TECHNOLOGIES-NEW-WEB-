import Link from "next/link";
import type { ProjectView } from "@/lib/content/server";
import { ProjectCard } from "./project-card";
import { WorkEmpty } from "./work-empty";

/** Homepage "Selected work": the first four published projects, or an honest empty state. */
export function SelectedWork({ projects }: { projects: ProjectView[] }) {
  const shown = projects.slice(0, 4);
  return (
    <section className="fxw" data-glow id="work" aria-labelledby="fxw-title">
      <div className="fx-container">
        <header className="fxw-head">
          <h2 id="fxw-title" className="fxw-h fx-d1 fx-up" data-fx="reveal-lines">
            Selected work
          </h2>
          <Link href="/work" className="fx-btn fx-btn--outline fx-hover-shift">
            View all work <span className="fx-shift" aria-hidden="true">→</span>
          </Link>
        </header>

        {shown.length ? (
          <div className="fxw-grid">
            {shown.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        ) : (
          <WorkEmpty />
        )}
      </div>
    </section>
  );
}
