import { pageMetadata } from "@/lib/metadata";
import { PageJsonLd } from "@/components/shared/page-jsonld";
import { getProjects } from "@/lib/content/server";
import { PageIntro } from "@/components/sections/page-intro";
import { WorkGallery } from "@/components/sections/work-gallery";
import { WorkEmpty } from "@/components/sections/work-empty";
import { WindowBuddy } from "@/components/art/characters";
import { PanelChart } from "@/components/art/scenes";

export const metadata = pageMetadata({
  title: "Work",
  description:
    "Selected projects from FRX Technologies — custom software, AI automation, web experiences and digital products.",
  path: "/work",
});

/** The full portfolio. Entirely admin-managed (/admin/projects); nothing is hard-coded or invented. */
export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <>
      <PageIntro
        eyebrow="Work"
        title="Selected work"
        lead={
          projects.length
            ? "Software, automation and digital products we have built."
            : "A software and technology company founded in 2026. Finished projects will appear here as they launch."
        }
        art={
          <>
            <WindowBuddy className="fxp-a fxp-a--win fxa-bob" />
            <PanelChart className="fxp-a fxp-a--panel2 fxa-bob" />
          </>
        }
      />
      <section className="fxw fxw--page" aria-label="Projects">
        <div className="fx-container">{projects.length ? <WorkGallery projects={projects} /> : <WorkEmpty />}</div>
      </section>
      <PageJsonLd path="/work" name="Work" description="Selected projects from FRX Technologies." />
    </>
  );
}
