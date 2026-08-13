export type ServiceSlug =
  | "web-development"
  | "ai-automation"
  | "software-development"
  | "ui-ux";

export type Service = {
  slug: ServiceSlug;
  index: string;
  /** Short name used in navigation, footers and the horizontal journey. */
  name: string;
  /** Longer name used as the page H1. */
  title: string;
  tagline: string;
  summary: string;
  /** Drives the abstract background scene on the detail page. */
  scene: "web" | "automation" | "software" | "interface";
  problems: string[];
  approach: { heading: string; body: string }[];
  capabilities: string[];
  technologies: string[];
  related: ServiceSlug[];
};

export const SERVICES: Service[] = [
  {
    slug: "ai-automation",
    index: "01",
    name: "AI & Automation",
    title: "AI Automation & Intelligent Workflows",
    tagline: "Work that runs itself.",
    summary:
      "Intelligent systems that automate repetitive processes, move information between platforms and trigger the next action without anyone remembering to do it.",
    scene: "automation",
    problems: [
      "The same data is typed into three different tools every day.",
      "Enquiries sit unanswered because nobody was notified.",
      "Reporting is assembled by hand at the end of every month.",
      "Processes live in one person's head and stall when they're away.",
    ],
    approach: [
      {
        heading: "Map the real workflow",
        body: "Before any tool is chosen we trace what actually happens today — who touches what, in which order, and where the process stalls. Automation applied to a broken workflow just breaks it faster.",
      },
      {
        heading: "Decide what should be automated",
        body: "Not every step should be. We separate the mechanical work from the judgement calls, then automate the mechanical parts and route the rest to a person with the right context attached.",
      },
      {
        heading: "Build the connective tissue",
        body: "Platforms are connected through automation infrastructure or purpose-built integrations, so information moves once and stays consistent everywhere it lands.",
      },
      {
        heading: "Add intelligence where it earns its place",
        body: "Language models handle the parts that resist rigid rules — classifying, extracting, summarising, drafting — inside a workflow that remains predictable and reviewable.",
      },
    ],
    capabilities: [
      "Workflow automation across business tools",
      "Data movement and synchronisation between platforms",
      "Automated notifications, routing and escalation",
      "Document and enquiry processing",
      "AI-assisted classification, extraction and summarisation",
      "Scheduled reporting and operational triggers",
      "Custom integrations where off-the-shelf connectors fall short",
    ],
    technologies: ["n8n", "Make", "Zapier", "OpenAI", "Azure OpenAI", "LangChain", "Node.js"],
    related: ["software-development", "web-development"],
  },
  {
    slug: "web-development",
    index: "02",
    name: "Web Experiences",
    title: "Custom Websites & Web Experiences",
    tagline: "Built for your business, not a template's.",
    summary:
      "Premium responsive websites designed around a specific business — its audience, its content and the actions it needs visitors to take.",
    scene: "web",
    problems: [
      "The site looks like everyone else's because it started as a template.",
      "Editing a single paragraph requires a developer.",
      "It's slow, and mobile visitors leave before it renders.",
      "Traffic arrives but nothing measurable happens next.",
    ],
    approach: [
      {
        heading: "Start from the content, not the layout",
        body: "We establish what has to be communicated and in what order before a single section is designed. Structure first means the design has something to be right about.",
      },
      {
        heading: "Design a system, not pages",
        body: "Type scale, spacing, colour, motion and components are defined once and reused. The result stays coherent as the site grows and stays cheap to extend.",
      },
      {
        heading: "Build for the devices people actually use",
        body: "Layouts are designed at mobile, laptop and desktop widths as distinct compositions. Small screens get a deliberate design, not a compressed desktop.",
      },
      {
        heading: "Hand over something you can run",
        body: "Where a project needs it, content is moved behind a CMS so the team can publish without a deployment.",
      },
    ],
    capabilities: [
      "Corporate and conversion-focused websites",
      "CMS-backed sites the team can edit",
      "Interactive and motion-driven experiences",
      "Ecommerce interfaces and storefronts",
      "Performance, accessibility and SEO foundations",
      "Integrations with existing business systems",
    ],
    technologies: ["Next.js", "React", "Angular", "Vue.js", "WordPress", "Webflow", "JavaScript"],
    related: ["ui-ux", "software-development"],
  },
  {
    slug: "software-development",
    index: "03",
    name: "Custom Software",
    title: "Web Applications, SaaS & Business Systems",
    tagline: "Software shaped around how you already work.",
    summary:
      "Dashboards, portals, internal tools and SaaS platforms built around specific operational workflows rather than bent to fit generic software.",
    scene: "software",
    problems: [
      "The business runs on a spreadsheet nobody is allowed to touch.",
      "Off-the-shelf software covers 60% of the process and blocks the rest.",
      "Information is scattered across tools that don't talk to each other.",
      "Nobody can answer a simple question without exporting three reports.",
    ],
    approach: [
      {
        heading: "Model the domain properly",
        body: "The data model is the product. We spend the time up front to get entities, states and permissions right, because retrofitting them later is what makes software expensive.",
      },
      {
        heading: "Build the smallest useful version",
        body: "The first release covers the workflow that hurts most. It goes into real use, and what gets built next is decided by what real usage exposes.",
      },
      {
        heading: "Design the interface for daily use",
        body: "Internal tools are used for hours a day. Density, keyboard flow and error states matter more here than they do on a marketing site.",
      },
      {
        heading: "Plan for the second year",
        body: "Deployment, backups, access control and observability are set up as part of the build, not bolted on after something goes wrong.",
      },
    ],
    capabilities: [
      "Operational dashboards and admin systems",
      "Customer and partner portals",
      "CRM and workflow platforms",
      "SaaS products with multi-user access",
      "Education and content platforms",
      "Reporting, analytics and data views",
      "APIs and integrations with existing systems",
    ],
    technologies: [
      "Next.js",
      "Node.js",
      ".NET Core",
      "PostgreSQL",
      "MySQL",
      "SQL Server",
      "MongoDB",
      "Oracle",
      "Firebase",
      "Power BI",
      "Flutter",
    ],
    related: ["ai-automation", "ui-ux"],
  },
  {
    slug: "ui-ux",
    index: "04",
    name: "UI/UX",
    title: "UI/UX & Digital Experiences",
    tagline: "Interfaces that explain themselves.",
    summary:
      "Interface and interaction design focused on hierarchy, usability and motion — for products people use every day and for experiences people remember.",
    scene: "interface",
    problems: [
      "Users need training to complete a routine task.",
      "Every new screen invents its own patterns.",
      "The design looks right in a mockup and falls apart on a phone.",
      "Design and engineering disagree about what 'done' means.",
    ],
    approach: [
      {
        heading: "Find the hierarchy",
        body: "Most interface problems are priority problems. We establish what matters most on each screen and let everything else recede.",
      },
      {
        heading: "Build a design system",
        body: "Tokens, components and states are defined once so the product stays consistent and engineering stops re-deciding the same things.",
      },
      {
        heading: "Design the in-between states",
        body: "Loading, empty, error and success states are designed alongside the happy path, because that's where products usually feel unfinished.",
      },
      {
        heading: "Use motion to explain",
        body: "Animation communicates where things came from and what changed. If a transition isn't clarifying something, it doesn't ship.",
      },
    ],
    capabilities: [
      "Product and application interface design",
      "Design systems and component libraries",
      "Responsive layout and interaction design",
      "Motion and transition design",
      "Information architecture and user flows",
      "Accessibility and contrast review",
      "Design-to-engineering handoff",
    ],
    technologies: ["React", "Next.js", "Flutter", "FlutterFlow", "Bubble", "Webflow"],
    related: ["web-development", "software-development"],
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * The horizontal journey on the homepage covers the full capability set, which
 * is broader than the four service detail routes. Panels that map to a route
 * link through; the others describe capability without implying a page.
 */
export const JOURNEY_PANELS = [
  {
    index: "01",
    title: "AI & Automation",
    body: "Intelligent workflows that remove repetitive work from the day.",
    href: "/services/ai-automation",
  },
  {
    index: "02",
    title: "Web Experiences",
    body: "Custom responsive websites designed around a single business.",
    href: "/services/web-development",
  },
  {
    index: "03",
    title: "Custom Software",
    body: "Web applications, portals and internal systems built to fit.",
    href: "/services/software-development",
  },
  {
    index: "04",
    title: "SaaS & Business Systems",
    body: "Products and platforms with real users, roles and operations.",
    href: "/services/software-development",
  },
  {
    index: "05",
    title: "UI/UX",
    body: "Interface and interaction design for products used every day.",
    href: "/services/ui-ux",
  },
  {
    index: "06",
    title: "AI Assistants",
    body: "Business-specific assistants for support, knowledge and workflow.",
    href: "/services/ai-automation",
  },
  {
    index: "07",
    title: "Process Automation",
    body: "Connecting the tools a business already runs on.",
    href: "/services/ai-automation",
  },
] as const;

/** Capability categories — what FRX can build. Not a portfolio, not client work. */
export const BUILD_CATEGORIES = [
  {
    title: "Business Platforms",
    body: "Operational dashboards, portals and internal systems that replace the spreadsheet everyone is afraid to touch.",
  },
  {
    title: "Education Platforms",
    body: "Learning environments, content systems and interactive tools for teaching at scale.",
  },
  {
    title: "Automation Systems",
    body: "Workflow automation that moves information between the tools a business already pays for.",
  },
  {
    title: "Digital Commerce",
    body: "Modern storefronts and the operational integrations that keep them stocked and accurate.",
  },
  {
    title: "AI Business Systems",
    body: "Assistants, intelligent search and workflow support grounded in a company's own information.",
  },
] as const;

export const PROCESS = [
  {
    index: "01",
    title: "Discover",
    body: "Understand the business, the workflow, the audience and the constraints before anything is proposed.",
  },
  {
    index: "02",
    title: "Define",
    body: "Translate requirements into product architecture, scope and an execution plan you can hold us to.",
  },
  {
    index: "03",
    title: "Design",
    body: "Create the interface, the interaction system and the product experience — including the states most projects skip.",
  },
  {
    index: "04",
    title: "Build",
    body: "Develop the product using technology selected for this project, not the one we used last time.",
  },
  {
    index: "05",
    title: "Refine",
    body: "Test, optimise, polish and remove friction until the thing feels finished rather than delivered.",
  },
  {
    index: "06",
    title: "Launch & Evolve",
    body: "Deploy production-ready software and keep improving it where the business needs it to go further.",
  },
] as const;

export const BELIEFS = [
  {
    title: "Build around the problem",
    body: "The requirement comes first. The stack is a consequence of it, never the starting point.",
  },
  {
    title: "Keep systems useful",
    body: "Software earns its place by being used. Features nobody opens are a cost, not an asset.",
  },
  {
    title: "Design intentionally",
    body: "Every decision — a spacing value, a transition, a default — is made rather than inherited.",
  },
  {
    title: "Automate intelligently",
    body: "Automate the mechanical work. Leave the judgement to people, with the right context in front of them.",
  },
  {
    title: "Engineer for growth",
    body: "The version that ships should not be the version that has to be thrown away to grow.",
  },
] as const;
