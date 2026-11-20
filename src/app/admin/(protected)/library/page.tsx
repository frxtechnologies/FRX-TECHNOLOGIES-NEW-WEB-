"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { mediaUrl } from "@/lib/content/media";
import { revalidateSite, uploadMedia } from "@/components/admin/media";

const FOLDERS = [
  ["hero", "Hero artwork"],
  ["services", "Service illustrations"],
  ["projects", "Projects"],
  ["technologies", "Technology logos"],
  ["testimonials", "Testimonial portraits"],
  ["affiliations", "Affiliations"],
] as const;

type Obj = { name: string; size: number };

/**
 * Media library: everything uploaded to the public `media` bucket, grouped by what
 * it is used for. Upload (resized in the browser), preview, copy the public address,
 * or delete. Images are assigned to their place from the screen that uses them
 * (Projects, Services, Homepage hero…); this is the overview and the place to tidy up.
 * Deleting is permanent, so it asks first and says so.
 */
export default function LibraryPage() {
  const supabase = useMemo(() => createClient() as unknown as SupabaseClient, []);
  const [folder, setFolder] = useState<(typeof FOLDERS)[number][0]>("hero");
  const [files, setFiles] = useState<Obj[] | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setFiles(null);
    const { data, error } = await supabase.storage.from("media").list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) {
      setMsg({
        tone: "error",
        text: /bucket not found/i.test(error.message)
          ? "The media bucket does not exist yet. Run the content migration in the Supabase SQL editor first."
          : error.message,
      });
      return setFiles([]);
    }
    setFiles(
      (data ?? [])
        .filter((o) => o.name && !o.name.startsWith("."))
        .map((o) => ({ name: o.name, size: (o.metadata as { size?: number } | null)?.size ?? 0 })),
    );
  }, [supabase, folder]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    setMsg(null);
    try {
      for (const f of Array.from(list)) await uploadMedia(supabase, f, folder);
      setMsg({ tone: "ok", text: `${list.length} file${list.length > 1 ? "s" : ""} uploaded.` });
      await load();
      revalidateSite();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (o: Obj) => {
    if (!window.confirm(`Permanently delete “${o.name}”? If it is used on the site, that image will disappear. This cannot be undone.`)) return;
    const { error } = await supabase.storage.from("media").remove([`${folder}/${o.name}`]);
    if (error) return setMsg({ tone: "error", text: error.message });
    setMsg({ tone: "ok", text: "Deleted." });
    await load();
    revalidateSite();
  };

  const copy = async (o: Obj) => {
    const url = mediaUrl(`${folder}/${o.name}`) ?? "";
    try {
      await navigator.clipboard.writeText(url);
      setMsg({ tone: "ok", text: "Address copied." });
    } catch {
      setMsg({ tone: "error", text: url });
    }
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Media library</h1>
          <p className="rm-intro">
            Images uploaded for the website, grouped by use. Assign an image from the screen that uses it (Projects, Services,
            Homepage hero…); use this page to upload in bulk, copy addresses and clear out old files.
          </p>
        </div>
      </header>

      <div className="rm-folders" role="tablist" aria-label="Folders">
        {FOLDERS.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={folder === id} className="rm-tab" onClick={() => setFolder(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="rm-actions rm-actions--left" style={{ marginTop: "1rem" }}>
        <label className="rm-drop">
          <input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} disabled={busy} />
          {busy ? "Uploading…" : "Upload images"}
        </label>
      </div>

      {msg && (
        <p role={msg.tone === "error" ? "alert" : "status"} className={msg.tone === "error" ? "rm-banner" : "rm-ok"}>
          {msg.text}
        </p>
      )}

      {files === null ? (
        <p className="rm-intro">Loading…</p>
      ) : files.length === 0 ? (
        <div className="admin-card rm-empty">
          <p>Nothing uploaded in this folder yet.</p>
        </div>
      ) : (
        <ul className="rm-lib">
          {files.map((o) => {
            const url = mediaUrl(`${folder}/${o.name}`);
            return (
              <li key={o.name}>
                <div className="rm-libimg">{url ? <Image src={url} alt="" width={176} height={132} unoptimized /> : null}</div>
                <small>
                  {o.name.slice(0, 22)}… {o.size ? `· ${(o.size / 1024).toFixed(0)} KB` : ""}
                </small>
                <div className="rm-actions rm-actions--left">
                  <button type="button" className="rm-btn rm-btn--ghost" onClick={() => copy(o)}>
                    Copy URL
                  </button>
                  <button type="button" className="rm-btn rm-btn--danger" onClick={() => remove(o)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
