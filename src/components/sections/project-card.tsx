import type { CSSProperties } from "react";
import type { ProjectView } from "@/lib/content/server";
import { ProjectImage } from "./project-image";
import "./work.css";

/**
 * One portfolio card. Every card is the same size: a fixed-ratio image box (the whole picture always
 * fits inside it, see ProjectImage), then category, title, a two-line description and, when the
 * project has a link, a "View project" affordance. The whole card opens the project in a new tab; the
 * raw URL is never displayed. Projects without any loadable image get a branded title poster.
 */
export function ProjectCard({ project, index }: { project: ProjectView; index: number }) {
  const body = (
    <>
      <div className="fxw-media">
        <ProjectImage
          images={project.images}
          alt={`${project.title}${project.category ? `, ${project.category}` : ""} — project by FRX Technologies`}
          title={project.title}
        />
        <span className="fxw-no fx-tabular" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        {project.url ? (
          <span className="fxw-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </span>
        ) : null}
      </div>

      <div className="fxw-meta">
        {project.category ? <p className="fx-label fxw-cat">{project.category}</p> : null}
        <h3 className="fxw-title">{project.title}</h3>
        {project.description ? <p className="fxw-desc">{project.description}</p> : null}
        {project.url ? (
          <span className="fxw-go" aria-hidden="true">
            View project <i>→</i>
          </span>
        ) : null}
      </div>
    </>
  );

  const style = { "--i": Math.min(index, 10) } as CSSProperties;
  const cut = project.cutout ? { "data-cut": "" } : {};
  return project.url ? (
    <a
      className="fxw-card"
      {...cut}
      style={style}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project.title} — open project in a new tab`}
    >
      {body}
    </a>
  ) : (
    <article className="fxw-card fxw-card--static" {...cut} style={style}>
      {body}
    </article>
  );
}
