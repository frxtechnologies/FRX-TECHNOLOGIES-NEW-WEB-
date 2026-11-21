export type ServiceSlug =
  | "software-development"
  | "ai-automation"
  | "web-development"
  | "mobile-app-development"
  | "web-applications-saas"
  | "business-systems-crm"
  | "ai-assistants-chatbots"
  | "ui-ux"
  | "data-analytics-bi";

/** Which original illustration represents the service (see components/art). */
export type ServiceArt =
  | "blocks"
  | "bot"
  | "automation"
  | "window"
  | "phone"
  | "laptop"
  | "board"
  | "chat"
  | "cursor"
  | "chart";

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
  scene: "web" | "automation" | "software" | "interface" | "mobile" | "business" | "assistant" | "data";
  art: ServiceArt;
  /** Optional uploaded illustration (admin → Services) that replaces the built-in art. */
  artUrl?: string | null;
  /** Concrete situations where this service is the answer. */
  useCases: string[];
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
    art: "automation",
    useCases: [
          "Route new enquiries to the right person and log them automatically.",
          "Keep two systems in sync without anyone re-typing data.",
          "Turn a monthly reporting scramble into a scheduled, automatic report.",
          "Classify and summarise incoming documents before a human sees them."
    ],
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
    art: "window",
    useCases: [
          "A company website the team can edit without a developer.",
          "An online store connected to stock and fulfilment.",
          "A fast landing experience for a launch or a campaign.",
          "A rebuild of a slow or outdated site on a modern foundation."
    ],
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
    art: "blocks",
    useCases: [
          "Replace the spreadsheet the whole business depends on.",
          "A customer or partner portal with its own logins.",
          "An internal tool shaped around one team's daily workflow.",
          "A first version of a product, built to be extended."
    ],
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
    art: "cursor",
    useCases: [
          "Untangle a product that needs training to use.",
          "Design a coherent system for a product that grew screen by screen.",
          "Prototype an idea before committing engineering time.",
          "Bring a mobile experience up to the standard of the desktop one."
    ],
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
  {
    slug: "mobile-app-development",
    index: "04",
    name: "Mobile Apps",
    title: "Mobile Application Development",
    tagline: "Your product, in everyone's pocket.",
    summary:
      "iOS and Android applications built to feel native, connected to the systems and data your business already runs on.",
    scene: "mobile",
    art: "phone",
    useCases: [
      "A customer-facing app for bookings, orders or accounts.",
      "A field-staff app that works from a phone instead of paperwork.",
      "A companion app for an existing web platform.",
      "An internal app for approvals, checklists or reporting.",
    ],
    problems: [
      "Customers expect an app and the business only has a website.",
      "Staff in the field still record work on paper and re-type it later.",
      "An existing web system is unusable on a small screen.",
      "Two separate apps for two platforms doubles every cost.",
    ],
    approach: [
      {
        heading: "Start from the thumb",
        body: "Mobile flows are designed for one hand, interrupted attention and unreliable connections, not shrunk from desktop screens.",
      },
      {
        heading: "One codebase where it makes sense",
        body: "Cross-platform frameworks such as Flutter let one team ship to both platforms, with native work reserved for where it is genuinely needed.",
      },
      {
        heading: "Connect it to the real system",
        body: "The app talks to the same data and rules as the rest of the business, so there is one source of truth rather than another silo.",
      },
    ],
    capabilities: [
      "iOS and Android applications",
      "Cross-platform development with Flutter",
      "Customer apps and internal staff apps",
      "Authentication, push notifications and offline support",
      "API and backend integration",
      "App store release preparation",
    ],
    technologies: ["Flutter", "FlutterFlow", "Firebase", "Supabase", "Node.js"],
    related: ["software-development", "ui-ux"],
  },
  {
    slug: "web-applications-saas",
    index: "05",
    name: "Web Apps & SaaS",
    title: "Web Applications & SaaS Platforms",
    tagline: "Products people sign in to, every day.",
    summary:
      "Multi-user web applications and subscription platforms — accounts, permissions, dashboards and billing-ready foundations — built to grow past a first version.",
    scene: "software",
    art: "laptop",
    useCases: [
      "Turn a service you deliver by hand into a product customers log into.",
      "A multi-tenant platform where each client sees only their own data.",
      "A dashboard-first product for a specific industry.",
      "An MVP to test an idea with real users.",
    ],
    problems: [
      "The service works, but it only scales as fast as you can personally deliver it.",
      "A prototype exists but it was never built to carry real users.",
      "Customers ask for logins, history and self-service you cannot offer.",
      "Every new client means a new spreadsheet.",
    ],
    approach: [
      {
        heading: "Model accounts and permissions early",
        body: "Who can see and change what is the hardest thing to retrofit. It is designed before the first screen.",
      },
      {
        heading: "Ship the smallest useful product",
        body: "The first release covers the workflow that matters most, goes into real use, and is extended by what real usage shows.",
      },
      {
        heading: "Build the foundations of a business",
        body: "Authentication, roles, audit trails and a clean data model are part of the build, so growth does not mean a rewrite.",
      },
    ],
    capabilities: [
      "SaaS and subscription platforms",
      "Multi-user dashboards and admin panels",
      "Authentication, roles and permissions",
      "Customer portals and self-service",
      "APIs and third-party integrations",
      "MVPs and first product releases",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "Node.js"],
    related: ["software-development", "business-systems-crm"],
  },
  {
    slug: "business-systems-crm",
    index: "06",
    name: "Business Systems",
    title: "Business Systems: CRM, CMS, LMS & POS",
    tagline: "The system your business actually runs on.",
    summary:
      "CRM, CMS, LMS, point-of-sale and business management platforms, shaped around your process instead of a vendor's idea of one.",
    scene: "business",
    art: "board",
    useCases: [
      "A CRM that matches how your team really sells and follows up.",
      "A content system so non-technical staff can publish.",
      "A learning platform for courses, cohorts and progress tracking.",
      "A point-of-sale and stock system for a retail or food business.",
    ],
    problems: [
      "Off-the-shelf software covers most of the process and blocks the rest.",
      "Customer, stock and sales information live in different places.",
      "Staff work around the system instead of in it.",
      "Reporting means exporting three files and merging them.",
    ],
    approach: [
      {
        heading: "Map how the work really flows",
        body: "We trace the process as it is practised, not as it is documented, and keep what works.",
      },
      {
        heading: "Build the system around it",
        body: "Records, stages, permissions and reports are designed around your workflow, with the screens staff use hours a day made fast.",
      },
      {
        heading: "Connect what already exists",
        body: "Where a good tool already works, it is integrated rather than replaced.",
      },
    ],
    capabilities: [
      "CRM and sales pipeline platforms",
      "CMS and content management",
      "LMS and learning platforms",
      "POS and inventory systems",
      "Business management and operations tools",
      "Custom dashboards and admin panels",
    ],
    technologies: ["Next.js", "Node.js", ".NET Core", "PostgreSQL", "SQL Server", "MySQL"],
    related: ["software-development", "data-analytics-bi"],
  },
  {
    slug: "ai-assistants-chatbots",
    index: "07",
    name: "AI Assistants",
    title: "AI Assistants, Chatbots & Voice Receptionists",
    tagline: "Answers at any hour, in your voice.",
    summary:
      "Chatbots, knowledge assistants, AI voice receptionists and sales assistants grounded in your own information and connected to your workflow.",
    scene: "assistant",
    art: "chat",
    useCases: [
      "A website assistant that answers common questions from your own content.",
      "A voice receptionist that answers calls and captures the details.",
      "An internal assistant that finds answers in company documents.",
      "A sales assistant that qualifies enquiries and books the next step.",
    ],
    problems: [
      "The same questions arrive by phone, chat and email all day.",
      "Calls go unanswered outside working hours.",
      "Staff spend time searching documents for answers that exist.",
      "Leads wait too long for a first response.",
    ],
    approach: [
      {
        heading: "Ground it in your information",
        body: "An assistant is only as good as what it knows. It answers from your content, and says so when it does not know.",
      },
      {
        heading: "Connect it to the workflow",
        body: "Conversations create enquiries, bookings or tasks in the systems you already use, rather than ending in a chat window.",
      },
      {
        heading: "Keep a human in the loop",
        body: "Clear hand-off to a person, reviewable conversations and sensible limits keep the assistant predictable.",
      },
    ],
    capabilities: [
      "Website and WhatsApp chatbots",
      "AI voice receptionists",
      "AI sales and enquiry assistants",
      "Internal knowledge assistants",
      "Hand-off to staff and CRM integration",
      "Conversation review and analytics",
    ],
    technologies: ["OpenAI", "Azure OpenAI", "Gemini", "LangChain", "n8n", "Node.js"],
    related: ["ai-automation", "business-systems-crm"],
  },
  {
    slug: "data-analytics-bi",
    index: "08",
    name: "Data & Analytics",
    title: "Data Analytics & Business Intelligence",
    tagline: "Answers, not exports.",
    summary:
      "Dashboards, reporting pipelines and business intelligence that turn the data you already collect into decisions you can act on.",
    scene: "data",
    art: "chart",
    useCases: [
      "One live dashboard in place of a weekly reporting scramble.",
      "Combine sales, stock and customer data that sit in different tools.",
      "Track the handful of numbers a team actually manages by.",
      "Clean and structure messy historical data before it is analysed.",
    ],
    problems: [
      "Nobody can answer a simple question without exporting three reports.",
      "Numbers differ depending on who built the spreadsheet.",
      "Reports are out of date by the time they are shared.",
      "Data exists, but nobody trusts it.",
    ],
    approach: [
      {
        heading: "Agree what to measure",
        body: "We start from the decisions the business makes and work backwards to the few numbers that inform them.",
      },
      {
        heading: "Bring the data together",
        body: "Sources are connected and cleaned once, so every report draws from the same, trusted figures.",
      },
      {
        heading: "Make it visible",
        body: "Dashboards are designed to be read in seconds, with the detail one click away.",
      },
    ],
    capabilities: [
      "Business intelligence dashboards",
      "Reporting automation and scheduled reports",
      "Data pipelines and integration",
      "Data cleaning and modelling",
      "Power BI and custom analytics views",
      "KPI tracking for operations and sales",
    ],
    technologies: ["Power BI", "PostgreSQL", "SQL Server", "Python", "Node.js"],
    related: ["business-systems-crm", "ai-automation"],
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

/** Display order and full names, as presented in the Services section. */
export const SERVICE_ORDER: ServiceSlug[] = [
  "software-development",
  "ai-automation",
  "web-development",
  "mobile-app-development",
  "web-applications-saas",
  "business-systems-crm",
  "ai-assistants-chatbots",
  "ui-ux",
  "data-analytics-bi",
];

export const SERVICE_LABEL: Record<ServiceSlug, string> = {
  "software-development": "Custom Software Development",
  "ai-automation": "AI Automation & Integrations",
  "web-development": "Web Development & E-commerce",
  "mobile-app-development": "Mobile Application Development",
  "web-applications-saas": "Web Applications & SaaS",
  "business-systems-crm": "Business Systems & CRM",
  "ai-assistants-chatbots": "AI Assistants & Chatbots",
  "ui-ux": "UI/UX & Digital Product Design",
  "data-analytics-bi": "Data Analytics & Business Intelligence",
};

SERVICES.sort((a, b) => SERVICE_ORDER.indexOf(a.slug) - SERVICE_ORDER.indexOf(b.slug));
SERVICES.forEach((s, i) => {
  s.index = String(i + 1).padStart(2, "0");
});
