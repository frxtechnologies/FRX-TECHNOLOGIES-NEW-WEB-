import { SOCIAL } from "@/lib/site";

/**
 * The FRX Quick Assistant is a scripted component, not a language model. Every
 * question and every answer is authored here, so it cannot invent capabilities,
 * pricing or claims about work FRX has not done.
 */

export type AssistantAction =
  | { kind: "link"; label: string; href: string; external?: boolean }
  | { kind: "route"; label: string; href: string };

export type AssistantEntry = {
  id: string;
  question: string;
  /** Compact label for the chip list. */
  chip: string;
  answer: string;
  actions?: AssistantAction[];
};

export const ASSISTANT_INTRO =
  "A short guide to what FRX does. Pick a question — every answer here is written by us, not generated.";

export const ASSISTANT_ENTRIES: AssistantEntry[] = [
  {
    id: "what",
    question: "What does FRX Technologies do?",
    chip: "What does FRX do?",
    answer:
      "FRX Technologies builds modern websites, web applications, custom software, AI automation systems, intelligent business assistants and digital product experiences designed around real business requirements.",
  },
  {
    id: "website",
    question: "Can FRX build a custom website?",
    chip: "Can you build a website?",
    answer:
      "Yes. FRX designs and develops custom responsive websites rather than limiting businesses to generic templates. Projects can include CMS functionality, integrations, custom interfaces and business-specific workflows depending on the requirements.",
    actions: [{ kind: "route", label: "Web Development", href: "/services/web-development" }],
  },
  {
    id: "software",
    question: "Can FRX build custom software?",
    chip: "Can you build software?",
    answer:
      "Yes. FRX develops web applications, SaaS platforms, dashboards, portals and custom business systems designed around specific workflows and operational needs.",
    actions: [{ kind: "route", label: "Custom Software", href: "/services/software-development" }],
  },
  {
    id: "automation",
    question: "Does FRX provide AI automation?",
    chip: "Do you do AI automation?",
    answer:
      "Yes. FRX can design AI-powered workflows and automation systems that reduce repetitive manual work, connect tools and help businesses handle processes more efficiently.",
    actions: [{ kind: "route", label: "AI & Automation", href: "/services/ai-automation" }],
  },
  {
    id: "chatbot",
    question: "Can FRX create an AI chatbot or assistant?",
    chip: "Can you build an AI assistant?",
    answer:
      "Yes. FRX can build business-specific assistants for use cases such as customer interaction, internal knowledge, workflow support and information retrieval, depending on the project's requirements.",
  },
  {
    id: "start",
    question: "How do I start a project with FRX?",
    chip: "How do I start a project?",
    answer:
      "Tell us what you're trying to build, the problem you're trying to solve and any requirements you already have. FRX can then discuss the project with you and determine an appropriate technical approach.",
    actions: [{ kind: "route", label: "Start a Project", href: "/contact" }],
  },
  {
    id: "tech",
    question: "What technologies does FRX use?",
    chip: "What technologies do you use?",
    answer:
      "FRX works across modern frontend, backend, database, AI, automation, cloud and no-code/low-code technologies. The technology stack is selected according to the needs of each project rather than forcing every project onto the same platform.",
  },
  {
    id: "follow",
    question: "Where can I follow FRX?",
    chip: "Where can I follow FRX?",
    answer:
      "You can follow FRX Technologies on Instagram and LinkedIn for company updates, new work and technology content.",
    actions: [
      { kind: "link", label: "Instagram", href: SOCIAL.instagram, external: true },
      { kind: "link", label: "LinkedIn", href: SOCIAL.linkedin, external: true },
    ],
  },
];
