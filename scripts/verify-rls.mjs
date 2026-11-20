#!/usr/bin/env node
/**
 * Verifies the Row Level Security behaviour of the live Supabase project using
 * ONLY the public anon key — exactly what any visitor holds.
 *
 *   node scripts/verify-rls.mjs            # reads .env.local
 *   node scripts/verify-rls.mjs --write    # also proves the visitor-insert paths
 *                                          # (stores ONE pending test review; delete it in /admin/reviews)
 *
 * Run it after applying supabase/migrations/20261120000100_frx_content.sql.
 * Tables that do not exist yet are reported as SKIPPED, not as passes.
 */
import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const WRITE = process.argv.includes("--write");
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

let pass = 0;
let fail = 0;
let skip = 0;
const ok = (name, cond, detail = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const skipped = (name, why) => {
  skip++;
  console.log(`SKIP  ${name}  — ${why}`);
};

const rest = async (method, path, body, extra = {}) => {
  const r = await fetch(`${URL_}/rest/v1/${path}`, { method, headers: { ...H, ...extra }, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: r.status, json };
};
const missing = (r) => r.json?.code === "PGRST205";

/* ---- existing tables --------------------------------------------------------------- */
{
  const r = await rest("GET", "inquiries?select=id&limit=5");
  ok("anon cannot read inquiries (private)", r.status === 200 && Array.isArray(r.json) && r.json.length === 0, `status ${r.status}, rows ${r.json?.length}`);
  const f = await rest("GET", "founders?select=id,name,role,image_path&limit=5");
  ok("anon can read founders (public)", f.status === 200 && f.json.length > 0);
  if (f.json?.[0]) {
    const same = await rest("PATCH", `founders?id=eq.${f.json[0].id}`, { name: f.json[0].name }, { Prefer: "return=representation" });
    ok("anon cannot update founders", Array.isArray(same.json) ? same.json.length === 0 : same.status >= 400, `status ${same.status}`);
  }
  const up = await rest("PATCH", "inquiries?id=neq.00000000-0000-0000-0000-000000000000", { status: "read" }, { Prefer: "return=representation" });
  ok("anon cannot update inquiries", Array.isArray(up.json) ? up.json.length === 0 : up.status >= 400, `status ${up.status}`);
}

/* ---- new content tables ------------------------------------------------------------- */
for (const t of ["projects", "technologies", "testimonials", "faqs", "affiliations", "services"]) {
  const r = await rest("GET", `${t}?select=id,published&limit=100`);
  if (missing(r)) {
    skipped(`${t}: only published rows are public`, "table not created — run the migration");
    continue;
  }
  ok(`${t}: anon sees only published rows`, r.status === 200 && r.json.every((x) => x.published === true), `${r.json.length} rows`);
  const ins = await rest("POST", t, [{ name: "x", title: "x", question: "xxx", answer: "xxx", text: "xxxxxxxxxx", slug: "x" }]);
  ok(`${t}: anon cannot insert`, ins.status >= 400, `status ${ins.status}`);
  const del = await rest("DELETE", `${t}?id=neq.00000000-0000-0000-0000-000000000000`, undefined, { Prefer: "return=representation" });
  ok(`${t}: anon cannot delete`, Array.isArray(del.json) ? del.json.length === 0 : del.status >= 400, `status ${del.status}`);
}

{
  const r = await rest("GET", "site_settings?select=key&limit=20");
  if (missing(r)) skipped("site_settings: readable, not writable", "table not created — run the migration");
  else {
    ok("site_settings: anon can read", r.status === 200);
    const w = await rest("POST", "site_settings", { key: "zz-test", value: {} });
    ok("site_settings: anon cannot write", w.status >= 400, `status ${w.status}`);
  }
}

/* ---- reviews: the important one -------------------------------------------------------- */
{
  const r = await rest("GET", "reviews?select=id,status&limit=100");
  if (missing(r)) {
    skipped("reviews: anon sees approved only", "table not created — run the migration");
  } else {
    ok("reviews: anon sees only approved reviews (no pending/rejected)", r.status === 200 && r.json.every((x) => x.status === "approved"), `${r.json.length} visible`);

    const forged = await rest("POST", "reviews", { name: "Forger", rating: 5, text: "I am trying to publish myself.", status: "approved" });
    ok("reviews: anon cannot insert an already-approved review", forged.status >= 400, `status ${forged.status}`);

    const upd = await rest("PATCH", "reviews?id=neq.00000000-0000-0000-0000-000000000000", { status: "approved" }, { Prefer: "return=representation" });
    ok("reviews: anon cannot approve reviews", Array.isArray(upd.json) ? upd.json.length === 0 : upd.status >= 400, `status ${upd.status}`);

    const del = await rest("DELETE", "reviews?id=neq.00000000-0000-0000-0000-000000000000", undefined, { Prefer: "return=representation" });
    ok("reviews: anon cannot delete reviews", Array.isArray(del.json) ? del.json.length === 0 : del.status >= 400, `status ${del.status}`);

    if (WRITE) {
      const token = crypto.randomUUID();
      const good = await rest("POST", "reviews", { name: "RLS Test", rating: 5, text: "Automated RLS check — safe to delete.", client_token: token });
      ok("reviews: anon CAN submit a pending review", good.status === 201, `status ${good.status}`);
      const dup = await rest("POST", "reviews", { name: "RLS Test", rating: 5, text: "Automated RLS check — safe to delete.", client_token: token });
      ok("reviews: same client_token cannot create a duplicate", dup.status === 409 || dup.status >= 400, `status ${dup.status}`);
      const back = await rest("GET", `reviews?client_token=eq.${token}&select=id`);
      ok("reviews: the pending submission is NOT readable by anon", back.status === 200 && back.json.length === 0);
      console.log("NOTE  one pending test review was stored; delete it in /admin/reviews");
    }
  }
}

/* ---- storage ------------------------------------------------------------------------------ */
{
  const up = await fetch(`${URL_}/storage/v1/object/media/rls-test/${Date.now()}.txt`, { method: "POST", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "text/plain" }, body: "x" });
  const j = await up.json().catch(() => ({}));
  if (/bucket not found/i.test(j.message ?? "")) skipped("storage: anon cannot upload to media", "bucket not created — run the migration");
  else ok("storage: anon cannot upload to the media bucket", up.status >= 400, `status ${up.status}`);
}

console.log(`\n${pass} passed, ${fail} failed, ${skip} skipped`);
process.exit(fail ? 1 : 0);
