import Image from "next/image";
import type { ProjectView } from "@/lib/content/server";

/**
 * One portfolio card. The image wrapper carries `data-fx="image-reveal"` (the
 * frame wipes open while the picture counter-scales), the arrow nudges on
 * hover, and when the project has a URL the whole card opens it in a new tab —
 * the raw URL is never displayed. Projects without a cover show a typographic
 * poster instead of a broken image.
 */
export function ProjectCard({
  project,
  index,
  describe = false,
  reveal = true,
}: {
  project: ProjectView;
  index: number;
  describe?: boolean;
  /** false = no scroll-reveal wrapper (used by the filterable gallery, which re-renders cards). */
  reveal?: boolean;
}) {
  const body = (
    <>
      <div className="fxw-media" {...(reveal ? { "data-fx": "image-reveal" } : {})}>
        <div className="fxw-img">
          {project.cover ? (
            <Image
              src={project.cover}
              alt={`${project.title} — ${project.category || "project"} by FRX Technologies`}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className="fxw-photo"
            />
          ) : (
            <span className="fxw-poster fx-up" aria-hidden="true">
              {project.title}
            </span>
          )}
        </div>
      </div>

      <div className="fxw-meta">
        <div className="fxw-titles">
          {project.category ? <p className="fx-label fxw-cat">{project.category}</p> : null}
          <h3 className="fxw-title fx-d3 fx-up">{project.title}</h3>
          {describe && project.description ? <p className="fx-body fxw-desc">{project.description}</p> : null}
          {describe && project.gallery.length > 0 ? (
            <span className="fxw-thumbs" aria-hidden="true">
              {project.gallery.slice(0, 3).map((g) => (
                <Image key={g} src={g} alt="" width={72} height={54} className="fxw-thumb" />
              ))}
            </span>
          ) : null}
        </div>
        {project.url ? (
          <span className="fxw-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </span>
        ) : null}
      </div>
    </>
  );

  return project.url ? (
    <a
      className="fxw-card"
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project.title} — open project in a new tab`}
    >
      {body}
    </a>
  ) : (
    <article className="fxw-card fxw-card--static">{body}</article>
  );
}
