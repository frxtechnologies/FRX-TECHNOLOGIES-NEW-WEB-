"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FounderRow } from "@/lib/supabase/types";
import { resizeImageForUpload } from "@/lib/resize-image";

/**
 * Edits the two rows the public Founders section reads. Uploading a new
 * portrait writes to the `founders` storage bucket (public read, admin-only
 * write per supabase/schema.sql) and points `image_path` at it; the public
 * site resolves that path to a URL itself, so nothing here needs to know
 * about CDN URLs or cache-busting beyond a timestamp query param.
 */
export default function FoundersAdminPage() {
  const [rows, setRows] = useState<FounderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const load = async () => {
    const { data, error: err } = await supabase
      .from("founders")
      .select("*")
      .order("position", { ascending: true });
    if (err) {
      setError(err.message);
      return;
    }
    setRows(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (id: string, changes: Partial<FounderRow>) => {
    setRows((rs) => rs?.map((r) => (r.id === id ? { ...r, ...changes } : r)) ?? null);
  };

  const save = async (row: FounderRow) => {
    const { error: err } = await supabase
      .from("founders")
      .update({ name: row.name, role: row.role, image_path: row.image_path })
      .eq("id", row.id);
    if (err) setError(err.message);
  };

  return (
    <>
      <header className="admin-header">
        <h1 className="admin-title">Founders</h1>
      </header>

      {error && (
        <p className="frx-error mb-4" role="alert">
          {error}
        </p>
      )}

      {rows === null ? (
        <p className="admin-empty">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <FounderEditor
              key={row.id}
              row={row}
              onChange={(changes) => patch(row.id, changes)}
              onSave={() => save({ ...row })}
              onError={setError}
            />
          ))}
        </div>
      )}
    </>
  );
}

function FounderEditor({
  row,
  onChange,
  onSave,
  onError,
}: {
  row: FounderRow;
  onChange: (changes: Partial<FounderRow>) => void;
  onSave: () => void;
  onError: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [bust, setBust] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const publicUrl = row.image_path
    ? `${supabase.storage.from("founders").getPublicUrl(row.image_path).data.publicUrl}?v=${bust}`
    : null;

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onError("Please choose an image file.");
      return;
    }
    setUploading(true);

    const previousPath = row.image_path;

    // Photos are re-encoded as JPEG (a fraction of PNG's size), but a PNG/WebP is kept as PNG so a
    // transparent cut-out portrait keeps its transparency instead of being flattened onto a colour.
    let upload: Blob;
    try {
      upload = await resizeImageForUpload(file);
    } catch {
      onError("Couldn't process that image. Try a different file.");
      setUploading(false);
      return;
    }
    const isPng = upload.type === "image/png";
    const path = `${row.id}-${Date.now()}.${isPng ? "png" : "jpg"}`;

    const { error: uploadErr } = await supabase.storage
      .from("founders")
      .upload(path, upload, {
        upsert: true,
        cacheControl: "3600",
        contentType: isPng ? "image/png" : "image/jpeg",
      });

    if (uploadErr) {
      onError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { error: updateErr } = await supabase
      .from("founders")
      .update({ image_path: path })
      .eq("id", row.id);

    if (updateErr) {
      onError(updateErr.message);
      setUploading(false);
      return;
    }

    if (previousPath) {
      await supabase.storage.from("founders").remove([previousPath]);
    }

    onChange({ image_path: path });
    setBust((b) => b + 1);
    setUploading(false);
  };

  return (
    <div className="admin-founder-row">
      <div className="flex flex-col gap-2">
        <div className="admin-founder-thumb">
          {publicUrl ? (
            <Image src={publicUrl} alt="" fill sizes="96px" className="object-cover" unoptimized />
          ) : (
            <div className="grid h-full w-full place-items-center text-[0.65rem] text-[var(--text-faint)]">
              No photo
            </div>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="admin-drop"
        >
          {uploading ? "Uploading…" : "Change photo"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="frx-field">
          <label className="frx-label">Name</label>
          <input
            className="frx-input"
            value={row.name}
            onChange={(e) => {
              onChange({ name: e.target.value });
              setDirty(true);
            }}
          />
          <span className="frx-field-rule" aria-hidden="true" />
        </div>
        <div className="frx-field">
          <label className="frx-label">Role</label>
          <input
            className="frx-input"
            value={row.role}
            onChange={(e) => {
              onChange({ role: e.target.value });
              setDirty(true);
            }}
          />
          <span className="frx-field-rule" aria-hidden="true" />
        </div>

        {dirty && (
          <button
            type="button"
            onClick={() => {
              onSave();
              setDirty(false);
            }}
            className="frx-textlink self-start text-step-xs"
          >
            Save changes
          </button>
        )}
      </div>
    </div>
  );
}
