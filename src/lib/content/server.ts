import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { FOUNDERS } from "@/lib/site";
import { SERVICES, type Service } from "@/lib/services";
import { DEFAULT_FAQS, DEFAULT_SETTINGS, DEFAULT_TECHNOLOGIES } from "./defaults";
import { mediaUrl } from "./media";
import type {
  AffiliationRow,
  FaqRow,
  ProjectRow,
  PublicFounder,
  ReviewRow,
  ServiceRow,
  Settings,
  TechnologyRow,
  TestimonialRow,
} from "./types";

/**
 * Public content for the marketing site, read with the anonymous key.
 *
 * Every read is defensive. If a table does not exist yet (the migration has not
 * been run), Supabase is unreachable, or a query fails, the caller gets the
 * built-in default instead of an error — a visitor never sees a broken page
 * because a content request failed. RLS is the real gate: anonymous requests
 * only ever see published rows and approved reviews.
 */

function anon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function list<T>(table: string, order = "position", ascending = true, limit = 200): Promise<T[] | null> {
  const sb = anon();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from(table)
      .select("*")
      .order(order, { ascending })
      .limit(limit);
    if (error || !data) return null;
    return data as T[];
  } catch {
    return null;
  }
}

/** Merge stored overrides on top of the defaults, key by key. */
export const getSettings = cache(async (): Promise<Settings> => {
  const merged: Settings = structuredClone(DEFAULT_SETTINGS);
  const sb = anon();
  if (!sb) return merged;
  try {
    const { data } = await sb.from("site_settings").select("key,value");
    for (const row of data ?? []) {
      const k = row.key as keyof Settings;
      if (k in merged && row.value && typeof row.value === "object") {
        // Only accept string-valued keys that exist in the default shape.
        for (const [field, val] of Object.entries(row.value as Record<string, unknown>)) {
          if (field in merged[k] && typeof val === "string") {
            (merged[k] as Record<string, string>)[field] = val;
          }
        }
      }
    }
  } catch {
    /* defaults */
  }
  return merged;
});

export type ProjectView = Omit<ProjectRow, "cover_path" | "gallery"> & {
  cover: string | null;
  gallery: string[];
};

export const getProjects = cache(async (): Promise<ProjectView[]> => {
  const rows = (await list<ProjectRow>("projects")) ?? [];
  return rows
    .filter((p) => p.published)
    .map((p) => ({
      ...p,
      cover: mediaUrl(p.cover_path),
      gallery: (Array.isArray(p.gallery) ? p.gallery : [])
        .map((g) => mediaUrl(g))
        .filter((g): g is string => !!g),
    }));
});

export type TechnologyView = Omit<TechnologyRow, "logo_path"> & { logo: string | null };

export const getTechnologies = cache(async (): Promise<TechnologyView[]> => {
  const rows = await list<TechnologyRow>("technologies");
  // `null` means "could not read"; an empty array means "owner removed them all".
  if (rows === null) {
    return DEFAULT_TECHNOLOGIES.map((t, i) => ({
      id: `default-${i}`,
      position: i,
      published: true,
      name: t.name,
      category: t.category,
      icon_key: null,
      url: null,
      logo: null,
    }));
  }
  return rows.filter((t) => t.published).map((t) => ({ ...t, logo: mediaUrl(t.logo_path) }));
});

export const getFaqs = cache(async (): Promise<Pick<FaqRow, "question" | "answer">[]> => {
  const rows = await list<FaqRow>("faqs");
  if (rows === null || rows.length === 0) return DEFAULT_FAQS;
  return rows.filter((f) => f.published);
});

export type TestimonialView = Omit<TestimonialRow, "portrait_path"> & { portrait: string | null };

export const getTestimonials = cache(async (): Promise<TestimonialView[]> => {
  const rows = (await list<TestimonialRow>("testimonials")) ?? [];
  return rows.filter((t) => t.published).map((t) => ({ ...t, portrait: mediaUrl(t.portrait_path) }));
});

/** Approved reviews only — RLS enforces this independently of the filter here. */
export const getApprovedReviews = cache(async (): Promise<ReviewRow[]> => {
  const rows = (await list<ReviewRow>("reviews", "created_at", false, 24)) ?? [];
  return rows.filter((r) => r.status === "approved");
});

export type AffiliationView = Omit<AffiliationRow, "logo_path"> & { logo: string | null };

export const getAffiliations = cache(async (): Promise<AffiliationView[]> => {
  const rows = (await list<AffiliationRow>("affiliations")) ?? [];
  return rows.filter((a) => a.published).map((a) => ({ ...a, logo: mediaUrl(a.logo_path) }));
});

/** Code defaults for each service, overridden field by field by any stored row. */
export const getServices = cache(async (): Promise<Service[]> => {
  const rows = (await list<ServiceRow>("services")) ?? [];
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return SERVICES.filter((s) => bySlug.get(s.slug)?.published !== false).map((s) => {
    const o = bySlug.get(s.slug);
    if (!o) return s;
    const arr = (v: unknown, fallback: string[]) =>
      Array.isArray(v) && v.length ? (v as string[]).filter((x) => typeof x === "string") : fallback;
    return {
      ...s,
      name: o.name || s.name,
      tagline: o.tagline || s.tagline,
      summary: o.summary || s.summary,
      capabilities: arr(o.capabilities, s.capabilities),
      useCases: arr(o.use_cases, s.useCases),
    };
  });
});

/** Old roles that predate the corrected titles; mapped at read time as well as in the migration. */
const ROLE_FIX: Record<string, Record<string, string>> = {
  "Feroze Mohiuddin": { Founder: "Founder & CEO", CTO: "Founder & CEO", "Founder & CTO": "Founder & CEO" },
  "Raaef Usman": { "Co-Founder": "Co-Founder & Director", "Co-founder": "Co-Founder & Director", CEO: "Co-Founder & Director" },
};

export const getFounders = cache(async (): Promise<PublicFounder[]> => {
  const fallback: PublicFounder[] = FOUNDERS.map((f) => ({
    name: f.name,
    role: ROLE_FIX[f.name]?.[f.role] ?? f.role,
    imageUrl: f.image,
  }));
  const rows = await list<{ name: string; role: string; image_path: string | null }>("founders");
  if (!rows?.length) return fallback;
  return rows.map((r) => ({
    name: r.name,
    role: ROLE_FIX[r.name]?.[r.role] ?? r.role,
    imageUrl: mediaUrl(r.image_path, "founders"),
  }));
});
