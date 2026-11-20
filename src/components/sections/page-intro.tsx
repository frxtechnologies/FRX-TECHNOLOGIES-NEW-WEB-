import type { ReactNode } from "react";

/**
 * Editorial opening for an inner page: eyebrow, an oversized headline that
 * reveals line by line, a lead paragraph and an optional art cluster. Used by
 * About, Work, Services and Contact so the pages read as one family.
 */
export function PageIntro({
  eyebrow,
  title,
  lead,
  art,
  as: Tag = "h1",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  art?: ReactNode;
  as?: "h1" | "h2";
  children?: ReactNode;
}) {
  return (
    <section className="fxp">
      <div className="fx-container fxp-wrap">
        <div className="fxp-copy">
          <p className="fx-label fxp-eyebrow">
            <span className="fxa-tick" aria-hidden="true" />
            {eyebrow}
          </p>
          <Tag className="fxp-title fx-d1 fx-up" data-fx="reveal-lines">
            {title}
          </Tag>
          {lead ? (
            <p className="fx-lead fxp-lead" data-fx="fade-up">
              {lead}
            </p>
          ) : null}
          {children}
        </div>
        {art ? (
          <div className="fxp-art" aria-hidden="true">
            {art}
          </div>
        ) : null}
      </div>
    </section>
  );
}
