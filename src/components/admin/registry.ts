import { SERVICES, SERVICE_LABEL } from "@/lib/services";
import { DEFAULT_FAQS, DEFAULT_SETTINGS, DEFAULT_TECHNOLOGIES } from "@/lib/content/defaults";
import type { ResourceConfig } from "./resource-manager";
import type { SettingsBlock } from "./settings-editor";

/**
 * Everything the admin can edit, declared as data. Adding a field here adds it
 * to the form, validation and storage; no per-page code. (Founders, inquiries
 * and the Quick Assistant keep their existing dedicated pages.)
 */

export const RESOURCES: Record<string, ResourceConfig> = {
  projects: {
    table: "projects",
    title: "Projects",
    singular: "Project",
    intro: "Portfolio items for the homepage and the Work page. Nothing is shown until you publish it. Only add real projects.",
    titleField: "title",
    subtitleField: "category",
    imageField: "cover_path",
    hasPublished: true,
    emptyText: "No projects yet. Add your first real project — it will not appear on the site until you publish it.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 120 },
      { name: "category", label: "Category", type: "text", max: 60, hint: "e.g. Web application, AI automation — used for the filter on the Work page." },
      { name: "description", label: "Description", type: "textarea", max: 1200, rows: 5 },
      { name: "url", label: "Project URL", type: "url", placeholder: "https://", hint: "The arrow on the project opens this. The address itself is never displayed." },
      { name: "cover_path", label: "Cover image", type: "image", folder: "projects", hint: "Landscape works best. Large files are resized automatically." },
      { name: "gallery", label: "Additional images", type: "images", folder: "projects" },
      { name: "published", label: "Published", type: "boolean", hint: "Show this project on the website" },
    ],
  },

  technologies: {
    table: "technologies",
    title: "Technologies",
    singular: "Technology",
    intro: "The tools shown in the horizontal Tools & Technologies section. Only list what FRX genuinely works with. Upload a logo to replace the typographic tile.",
    titleField: "name",
    subtitleField: "category",
    imageField: "logo_path",
    hasPublished: true,
    seed: DEFAULT_TECHNOLOGIES.map((t) => ({ name: t.name, category: t.category, published: true })),
    seedLabel: "Load the starting list",
    emptyText: "No technologies yet. The website currently shows the built-in starting list — load it here to edit it.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 60 },
      { name: "category", label: "Category", type: "text", max: 60, placeholder: "Frontend, Database, AI…" },
      { name: "logo_path", label: "Logo", type: "image", folder: "technologies", hint: "Square or wide logos both work. Only upload marks you have the right to display." },
      { name: "url", label: "Link", type: "url", placeholder: "https://", hint: "Optional." },
      { name: "published", label: "Published", type: "boolean", default: true, hint: "Show on the website" },
    ],
  },

  testimonials: {
    table: "testimonials",
    title: "Testimonials",
    singular: "Testimonial",
    intro: "Real, approved testimonials only. The testimonials section stays hidden on the website until at least one is published.",
    titleField: "name",
    subtitleField: "text",
    imageField: "portrait_path",
    hasPublished: true,
    emptyText: "No testimonials yet — and the section stays hidden until you add a real one.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 80 },
      { name: "designation", label: "Designation", type: "text", max: 80, placeholder: "e.g. Operations Director" },
      { name: "company", label: "Company", type: "text", max: 80 },
      { name: "text", label: "Review", type: "textarea", required: true, max: 1200, rows: 5 },
      { name: "portrait_path", label: "Portrait (optional)", type: "image", folder: "testimonials" },
      { name: "published", label: "Published", type: "boolean", hint: "Show on the website" },
    ],
  },

  faq: {
    table: "faqs",
    title: "FAQ",
    singular: "Question",
    intro: "Questions and answers for the FAQ section. Do not state guarantees, prices or timelines you have not agreed.",
    titleField: "question",
    subtitleField: "answer",
    hasPublished: true,
    seed: DEFAULT_FAQS.map((f) => ({ ...f, published: true })),
    seedLabel: "Load the starting questions",
    emptyText: "No questions yet. The website shows the built-in starting questions — load them here to edit them.",
    fields: [
      { name: "question", label: "Question", type: "text", required: true, max: 200 },
      { name: "answer", label: "Answer", type: "textarea", required: true, max: 2000, rows: 5 },
      { name: "published", label: "Published", type: "boolean", default: true, hint: "Show on the website" },
    ],
  },

  affiliations: {
    table: "affiliations",
    title: "Affiliations",
    singular: "Affiliation",
    intro: "Genuine partnerships, certifications or memberships FRX can substantiate. The Affiliations strip stays hidden until you publish one. Never add anything you cannot prove.",
    titleField: "name",
    subtitleField: "description",
    imageField: "logo_path",
    hasPublished: true,
    emptyText: "No affiliations yet — and none are shown on the site. Add only real ones.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 100 },
      { name: "description", label: "Description", type: "textarea", max: 600, rows: 5, hint: "One paragraph per line. Wrap a phrase in **double asterisks** to highlight it with the animated marker." },
      { name: "url", label: "Link", type: "url", placeholder: "https://" },
      { name: "logo_path", label: "Logo", type: "image", folder: "affiliations" },
      { name: "published", label: "Published", type: "boolean", hint: "Show on the website" },
    ],
  },

  services: {
    table: "services",
    title: "Services",
    singular: "Service",
    intro: "Edit the wording of each service page. The page layout, URLs and illustrations are fixed; what you change here overrides the built-in text.",
    titleField: "name",
    subtitleField: "tagline",
    hasPublished: true,
    seed: SERVICES.map((s) => ({
      slug: s.slug,
      name: s.name,
      tagline: s.tagline,
      summary: s.summary,
      capabilities: s.capabilities,
      use_cases: s.useCases,
      published: true,
    })),
    seedLabel: "Load the current service text",
    emptyText: "The website is using the built-in service text. Load it here to edit it.",
    fields: [
      { name: "slug", label: "Service", type: "select", required: true, options: SERVICES.map((s) => s.slug), hint: `Which page this text belongs to: ${SERVICES.map((s) => `${s.slug} = ${SERVICE_LABEL[s.slug]}`).join("; ")}` },
      { name: "name", label: "Short name", type: "text", required: true, max: 80 },
      { name: "tagline", label: "Tagline", type: "text", max: 160 },
      { name: "summary", label: "Summary", type: "textarea", max: 800, rows: 4 },
      { name: "capabilities", label: "Capabilities", type: "lines", hint: "One per line." },
      { name: "use_cases", label: "Business use cases", type: "lines", hint: "One per line." },
      { name: "art_path", label: "Illustration (optional)", type: "image", folder: "services", hint: "Replaces the built-in illustration for this service. A transparent PNG about 900px tall works best." },
      { name: "published", label: "Published", type: "boolean", default: true, hint: "Show this service on the website" },
    ],
  },
};

const d = DEFAULT_SETTINGS;

export const SETTINGS_PAGES: Record<string, { title: string; intro: string; blocks: SettingsBlock[] }> = {
  homepage: {
    title: "Homepage hero",
    intro: "The supporting headline and description under BUILD. AUTOMATE. SCALE., and replaceable artwork for the hero characters.",
    blocks: [
      {
        key: "hero",
        title: "Hero",
        defaults: { ...d.hero },
        fields: [
          { name: "supportingHeadline", label: "Supporting headline", type: "text", required: true, max: 120 },
          { name: "description", label: "Description", type: "textarea", max: 400, rows: 3 },
          { name: "imageWindow", label: "Artwork slot: BUILD character", type: "image", folder: "hero", hint: "Optional. Replaces the built-in illustration. A transparent PNG about 800px tall works best." },
          { name: "imageBot", label: "Artwork slot: AUTOMATE character", type: "image", folder: "hero" },
          { name: "imageBlocks", label: "Artwork slot: SCALE character", type: "image", folder: "hero" },
        ],
      },
    ],
  },
  media: {
    title: "Instagram reel",
    intro: "The reel shown in the “See us in motion” section. It uses Instagram's own player, loads only when scrolled near, and never autoplays sound.",
    blocks: [
      {
        key: "media",
        title: "Reel",
        defaults: { ...d.media },
        fields: [
          { name: "reelUrl", label: "Instagram reel link", type: "url", required: true, placeholder: "https://www.instagram.com/reel/…" },
          { name: "reelHeading", label: "Heading", type: "text", max: 80 },
          { name: "reelText", label: "Short text", type: "textarea", rows: 2, max: 240 },
        ],
      },
    ],
  },
  about: {
    title: "About page",
    intro: "Everything on the About page and the homepage “A bit about us” preview. Use only factual company information.",
    blocks: [
      {
        key: "about",
        title: "About content",
        defaults: { ...d.about },
        fields: [
          { name: "lead", label: "Headline", type: "textarea", rows: 2, max: 200 },
          { name: "story", label: "Company story", type: "textarea", rows: 9, max: 3000, hint: "Separate paragraphs with a blank line. The first paragraph is shown largest." },
          { name: "statement", label: "Scroll-linked statement", type: "textarea", rows: 3, max: 400 },
          { name: "preview", label: "Homepage preview text", type: "textarea", rows: 5, max: 700, hint: "The paragraph under “A bit about us” on the homepage." },
          { name: "values", label: "How we work (rules)", type: "textarea", rows: 7, max: 2500, hint: "One per line: Title | description" },
          { name: "different", label: "What makes FRX different", type: "textarea", rows: 6, max: 2000, hint: "One per line: Title | description. Up to four are shown with illustrations." },
        ],
      },
    ],
  },
  contact: {
    title: "Contact & social",
    intro: "Shown in the Contact section, the footer and the floating WhatsApp button.",
    blocks: [
      {
        key: "contact",
        title: "Contact details",
        defaults: { ...d.contact },
        fields: [
          { name: "email", label: "Email", type: "text", required: true, max: 160 },
          { name: "phone", label: "Phone", type: "text", max: 40 },
          { name: "whatsappDisplay", label: "WhatsApp number (as displayed)", type: "text", max: 40 },
          { name: "whatsappNumber", label: "WhatsApp number (digits only, with country code)", type: "text", max: 20, hint: "Used for the floating button link wa.me/… e.g. 923004703005" },
        ],
      },
      {
        key: "social",
        title: "Social links",
        intro: "Leave blank to hide a link.",
        defaults: { ...d.social },
        fields: [
          { name: "instagram", label: "Instagram", type: "url", placeholder: "https://" },
          { name: "linkedin", label: "LinkedIn", type: "url", placeholder: "https://" },
          { name: "facebook", label: "Facebook", type: "url", placeholder: "https://" },
          { name: "x", label: "X", type: "url", placeholder: "https://" },
          { name: "github", label: "GitHub", type: "url", placeholder: "https://" },
          { name: "youtube", label: "YouTube", type: "url", placeholder: "https://" },
        ],
      },
    ],
  },
  footer: {
    title: "Footer",
    intro: "The text in the site footer. Navigation, services and contact details are filled in automatically.",
    blocks: [
      {
        key: "footer",
        title: "Footer text",
        defaults: { ...d.footer },
        fields: [
          { name: "blurb", label: "Short description", type: "textarea", rows: 3, max: 300 },
          { name: "copyright", label: "Copyright line", type: "text", max: 120, hint: "The year is added automatically." },
        ],
      },
    ],
  },
};

export const ADMIN_NAV: { href: string; label: string; group: string }[] = [
  { href: "/admin", label: "Overview", group: "Inbox" },
  { href: "/admin/inquiries", label: "Inquiries", group: "Inbox" },
  { href: "/admin/reviews", label: "Reviews", group: "Inbox" },
  { href: "/admin/projects", label: "Projects", group: "Content" },
  { href: "/admin/services", label: "Services", group: "Content" },
  { href: "/admin/technologies", label: "Technologies", group: "Content" },
  { href: "/admin/testimonials", label: "Testimonials", group: "Content" },
  { href: "/admin/faq", label: "FAQ", group: "Content" },
  { href: "/admin/affiliations", label: "Affiliations", group: "Content" },
  { href: "/admin/founders", label: "Founders", group: "Content" },
  { href: "/admin/theme", label: "Theme", group: "Pages" },
  { href: "/admin/homepage", label: "Homepage hero", group: "Pages" },
  { href: "/admin/media", label: "Instagram reel", group: "Pages" },
  { href: "/admin/about", label: "About page", group: "Pages" },
  { href: "/admin/contact", label: "Contact & social", group: "Pages" },
  { href: "/admin/footer", label: "Footer", group: "Pages" },
  { href: "/admin/assistant", label: "Quick Assistant", group: "Pages" },
];
