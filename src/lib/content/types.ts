/**
 * Shapes of everything the admin panel can edit. Defaults live in defaults.ts
 * (so the site renders correctly before the migration is run and whenever
 * Supabase is unreachable); Supabase rows override them.
 */

export type Contact = {
  email: string;
  phone: string;
  /** How the Pakistan WhatsApp number is displayed. */
  whatsappDisplay: string;
  /** Digits only, international format, used for wa.me links. */
  whatsappNumber: string;
};

export type Social = {
  instagram: string;
  linkedin: string;
  facebook: string;
  x: string;
  github: string;
  youtube: string;
};

export type FooterContent = {
  blurb: string;
  copyright: string;
};

export type HeroContent = {
  supportingHeadline: string;
  description: string;
  /** Optional uploaded artwork. When set it replaces the built-in SVG character. */
  imageWindow: string;
  imageBot: string;
  imageBlocks: string;
};

export type AboutContent = {
  lead: string;
  /** Paragraphs separated by a blank line. */
  story: string;
  /** The scroll-linked statement. */
  statement: string;
  /** One per line: "Title | description". */
  values: string;
  /** One per line: "Title | description". */
  different: string;
  /** Short preview used on the homepage "A bit about us" section. */
  preview: string;
};

export type LayoutContent = {
  /** Comma-separated homepage section ids the admin has hidden. */
  hidden: string;
};

export type MediaContent = {
  reelUrl: string;
  reelHeading: string;
  reelText: string;
  /** Project titles (one per line) whose cover has its flat background removed — isolated logos / product graphics only. */
  cutoutProjects: string;
};

export type Settings = {
  contact: Contact;
  social: Social;
  footer: FooterContent;
  hero: HeroContent;
  about: AboutContent;
  theme: ThemeSettings;
  media: MediaContent;
  layout: LayoutContent;
};

import type { ThemeSettings } from "@/lib/theme-config";

type Base = { id: string; position: number; published: boolean };

export type ProjectRow = Base & {
  title: string;
  category: string;
  description: string;
  url: string | null;
  cover_path: string | null;
  gallery: string[];
};

export type TechnologyRow = Base & {
  name: string;
  category: string;
  logo_path: string | null;
  icon_key: string | null;
  url: string | null;
};

export type TestimonialRow = Base & {
  name: string;
  designation: string;
  company: string;
  text: string;
  portrait_path: string | null;
};

export type FaqRow = Base & { question: string; answer: string };

export type AffiliationRow = Base & {
  name: string;
  description: string;
  url: string | null;
  logo_path: string | null;
};

export type ServiceRow = Base & {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  capabilities: string[];
  use_cases: string[];
  art_path: string | null;
};

export type ReviewRow = {
  id: string;
  created_at: string;
  name: string;
  company: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected";
};

export type PublicFounder = {
  name: string;
  role: string;
  imageUrl: string | null;
};
