import { SOCIAL } from "@/lib/site";
import { DEFAULT_THEME_SETTINGS } from "@/lib/theme-config";
import type {
  AboutContent,
  FaqRow,
  Settings,
  TechnologyRow,
} from "./types";

/**
 * Default content. Everything here is either a fact the founders gave us or
 * deliberately generic. Nothing is a client, a result, a guarantee or a price.
 * Admin edits (Supabase) replace these values; deleting an override returns to
 * these.
 */

export const DEFAULT_SETTINGS: Settings = {
  theme: DEFAULT_THEME_SETTINGS,
  media: {
    reelUrl: "https://www.instagram.com/reel/DfwXDBzOfos/",
    reelHeading: "See us in motion.",
    reelText: "A short reel from the FRX Technologies Instagram.",
  },
  contact: {
    email: "frx.technologies@gmail.com",
    phone: "+44 7835 448310",
    whatsappDisplay: "03004703005",
    whatsappNumber: "923004703005",
  },
  social: {
    instagram: SOCIAL.instagram,
    linkedin: SOCIAL.linkedin,
    facebook: "",
    x: "",
    github: "",
    youtube: "",
  },
  footer: {
    blurb:
      "A software and technology company building custom software, AI automation, web experiences and digital products.",
    copyright: "FRX Technologies. All rights reserved.",
  },
  hero: {
    supportingHeadline: "We engineer the systems businesses run on.",
    description:
      "FRX Technologies is a software and technology company founded in 2026 by Feroze Mohiuddin and Raaef Usman.\nWe build **custom software**, **intelligent AI automation**, **web experiences** and **digital products** that make businesses **easier to operate** and **ready to scale**.",
    imageWindow: "",
    imageBot: "",
    imageBlocks: "",
  },
  about: {
    lead: "A software company built to make technology do more of the work.",
    story: [
      "FRX Technologies was founded in 2026 by Feroze Mohiuddin and Raaef Usman, focusing on custom software, AI automation, web experiences and digital products.",
      "We are a software development and digital solutions company. We design and build the systems a business actually runs on — applications, automations, dashboards and the interfaces people use every day.",
      "Our approach is simple to state and harder to do: we build technology around businesses, not the other way around.",
    ].join("\n\n"),
    statement:
      "We build software that removes friction, automation that removes repetition, and digital products that help businesses move forward.",
    values: [
      "Build around the problem | The requirement comes first. The stack is a consequence of it, never the starting point.",
      "Keep systems useful | Software earns its place by being used. Features nobody opens are a cost, not an asset.",
      "Design intentionally | Every decision — a spacing value, a transition, a default — is made rather than inherited.",
      "Automate intelligently | Automate the mechanical work. Leave the judgement to people, with the right context in front of them.",
      "Engineer for growth | The version that ships should not be the version that has to be thrown away to grow.",
    ].join("\n"),
    different: [
      "Software first | We are a software and technology company. Websites are one of the things we build — not the only thing.",
      "Workflow before tooling | We start from how the work actually happens, then choose the technology that fits it.",
      "AI where it earns its place | Language models handle what resists rigid rules, inside systems that stay predictable and reviewable.",
      "Designed and engineered together | Interface, data model and automation are shaped as one product, not handed between teams.",
    ].join("\n"),
    preview:
      "FRX Technologies is a software and technology company founded in 2026 by Feroze Mohiuddin and Raaef Usman. We build custom software, intelligent automation, web experiences and digital products — the systems businesses run on, made practical, scalable and easier to operate.",
  } satisfies AboutContent,
};

export const DEFAULT_FAQS: Pick<FaqRow, "question" | "answer">[] = [
  {
    question: "What does FRX Technologies do?",
    answer:
      "FRX Technologies is a software and technology company founded in 2026. We build custom software, AI automation, web and mobile applications, and digital products for businesses.",
  },
  {
    question: "What software solutions can FRX build?",
    answer:
      "Custom software, web applications and SaaS platforms, websites and e-commerce, mobile apps, CRM, CMS and LMS platforms, POS and business management systems, dashboards and admin panels, AI chatbots and assistants, and analytics and business intelligence tools.",
  },
  {
    question: "How does a project begin?",
    answer:
      "With a conversation. Send an enquiry through the contact form and tell us what you are trying to build and the problem behind it. We will reply by email to talk through the scope and what the next step looks like.",
  },
  {
    question: "Can FRX build custom business systems?",
    answer:
      "Yes. Internal tools, customer portals, CRM and workflow platforms, point-of-sale and business management systems are built around how your operation actually works, rather than bent to fit generic software.",
  },
  {
    question: "Does FRX offer AI automation?",
    answer:
      "Yes. That includes workflow automation, integrations between the tools you already use, AI chatbots and assistants, and AI voice receptionists and sales assistants.",
  },
  {
    question: "How can a business get started?",
    answer:
      "Use the contact form, email frx.technologies@gmail.com or message us on WhatsApp. Tell us what you want to build and we will take it from there.",
  },
];

/**
 * The initial technology list. These are the tools FRX has named; the owner
 * should review it and add, remove or reorder entries in /admin/technologies.
 * No logos are bundled — third-party marks carry their own usage terms, so each
 * entry shows a typographic tile until a real logo is uploaded.
 */
export const DEFAULT_TECHNOLOGIES: Pick<TechnologyRow, "name" | "category">[] = [
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "JavaScript", category: "Language" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "GSAP", category: "Motion" },
  { name: "Node.js", category: "Backend" },
  { name: "Python", category: "Language" },
  { name: "Flutter", category: "Mobile" },
  { name: "Supabase", category: "Backend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "MongoDB", category: "Database" },
  { name: "Firebase", category: "Database" },
  { name: "OpenAI", category: "AI" },
  { name: "Gemini", category: "AI" },
  { name: "n8n", category: "Automation" },
  { name: "Make.com", category: "Automation" },
  { name: "Shopify", category: "Commerce" },
  { name: "WordPress", category: "CMS" },
];
