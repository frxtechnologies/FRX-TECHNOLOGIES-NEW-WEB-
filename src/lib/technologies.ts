export type TechCategory = {
  key: string;
  label: string;
  note: string;
  items: string[];
};

/**
 * Grouped rather than dumped into one grid. Logos are not shipped — third-party
 * marks carry their own usage terms, and a controlled typographic treatment is a
 * stronger presentation than thirty mismatched PNGs anyway.
 */
export const TECH_CATEGORIES: TechCategory[] = [
  {
    key: "frontend",
    label: "Frontend",
    note: "The layer people actually touch.",
    items: ["React", "Next.js", "Angular", "Vue.js", "JavaScript", "TypeScript"],
  },
  {
    key: "backend",
    label: "Backend",
    note: "Where the rules live.",
    items: ["Node.js", ".NET Core"],
  },
  {
    key: "mobile",
    label: "Mobile",
    note: "One codebase, both platforms.",
    items: ["Flutter", "FlutterFlow"],
  },
  {
    key: "data",
    label: "Databases",
    note: "Chosen for the shape of the data, not habit.",
    items: ["PostgreSQL", "MySQL", "SQL Server", "MongoDB", "Oracle", "Firebase"],
  },
  {
    key: "ai",
    label: "AI",
    note: "Applied where rules stop working.",
    items: ["OpenAI", "Azure OpenAI", "Gemini", "LangChain"],
  },
  {
    key: "automation",
    label: "Automation",
    note: "The connective tissue between tools.",
    items: ["n8n", "Make", "Zapier"],
  },
  {
    key: "platforms",
    label: "Platforms",
    note: "When shipping fast matters more than owning every line.",
    items: ["WordPress", "Webflow", "Bubble"],
  },
  {
    key: "analytics",
    label: "Analytics",
    note: "Answers, not exports.",
    items: ["Power BI"],
  },
];

export const TECH_COUNT = TECH_CATEGORIES.reduce((n, c) => n + c.items.length, 0);
