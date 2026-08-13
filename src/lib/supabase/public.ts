"use client";

import { createClient } from "./client";
import type { AssistantEntryRow, FounderRow } from "./types";

/**
 * Read-only helpers for the public site. Every call swallows its own errors
 * and returns `null` rather than throwing, because the site has a perfectly
 * good static fallback for both of these (`lib/assistant.ts`,
 * `lib/site.ts#FOUNDERS`) and a visitor should never see a broken page
 * because Supabase was briefly unreachable or the project isn't configured
 * in this environment.
 *
 * Both results are cached for the life of the tab. `Founders` renders on both
 * `/` and `/about`, and each is a full page component (not shared layout
 * state), so navigating between them without this would re-issue the same
 * Supabase query every time — a real, avoidable network request, not a
 * theoretical one. A page reload naturally clears it, which is exactly when
 * picking up admin-panel edits actually matters.
 */

let foundersCache: PublicFounder[] | null | undefined;
let foundersInFlight: Promise<PublicFounder[] | null> | null = null;

let assistantCache: AssistantEntryRow[] | null | undefined;
let assistantInFlight: Promise<AssistantEntryRow[] | null> | null = null;

export function fetchPublishedAssistantEntries(): Promise<AssistantEntryRow[] | null> {
  if (assistantCache !== undefined) return Promise.resolve(assistantCache);
  if (assistantInFlight) return assistantInFlight;

  assistantInFlight = (async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("assistant_entries")
        .select("*")
        .eq("published", true)
        .order("position", { ascending: true });
      const result = error || !data ? null : data;
      assistantCache = result;
      return result;
    } catch {
      assistantCache = null;
      return null;
    } finally {
      assistantInFlight = null;
    }
  })();

  return assistantInFlight;
}

export type PublicFounder = {
  name: string;
  role: string;
  imageUrl: string | null;
};

export function fetchPublicFounders(): Promise<PublicFounder[] | null> {
  if (foundersCache !== undefined) return Promise.resolve(foundersCache);
  if (foundersInFlight) return foundersInFlight;

  foundersInFlight = (async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("founders")
        .select("*")
        .order("position", { ascending: true });

      if (error || !data?.length) {
        foundersCache = null;
        return null;
      }

      const result = data.map((row: FounderRow) => ({
        name: row.name,
        role: row.role,
        imageUrl: row.image_path
          ? supabase.storage.from("founders").getPublicUrl(row.image_path).data.publicUrl
          : null,
      }));
      foundersCache = result;
      return result;
    } catch {
      foundersCache = null;
      return null;
    } finally {
      foundersInFlight = null;
    }
  })();

  return foundersInFlight;
}
