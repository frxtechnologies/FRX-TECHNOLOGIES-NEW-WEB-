-- FRX Technologies — additional technologies for the "Technologies we work with daily" line.
-- ADDITIVE and SAFE TO RE-RUN: it only inserts a technology when no row with that name exists yet
-- (case-insensitive). Nothing is updated, deleted or reordered. Run it in the Supabase SQL editor.
--
-- The logos are repo-hosted SVGs in /public/tech (Devicon, MIT) — no storage upload is involved.
--
-- Review the list before running: only keep technologies FRX genuinely works with or intends to
-- support. You can also remove or add any of them later in /admin/technologies.

insert into public.technologies (name, category, logo_path, published, position)
select v.name, v.category, v.logo_path, true,
       coalesce((select max(position) from public.technologies), -1) + v.ord
from (values
  ('Docker',       'DevOps',    '/tech/docker.svg',       1),
  ('Redis',        'Database',  '/tech/redis.svg',        2),
  ('AWS',          'Cloud',     '/tech/aws.svg',          3),
  ('Google Cloud', 'Cloud',     '/tech/google-cloud.svg', 4),
  ('Cloudflare',   'Cloud',     '/tech/cloudflare.svg',   5),
  ('Vercel',       'Hosting',   '/tech/vercel.svg',       6),
  ('GitHub',       'DevOps',    '/tech/github.svg',       7),
  ('Figma',        'Design',    '/tech/figma.svg',        8),
  ('FastAPI',      'Backend',   '/tech/fastapi.svg',      9),
  ('Django',       'Backend',   '/tech/django.svg',      10),
  ('Prisma',       'Backend',   '/tech/prisma.svg',      11),
  ('Astro',        'Frontend',  '/tech/astro.svg',       12)
  -- Optional — uncomment only if FRX works with them:
  -- ,('Svelte',     'Frontend',  '/tech/svelte.svg',      13)
  -- ,('Kubernetes', 'DevOps',    '/tech/kubernetes.svg',  14)
) as v(name, category, logo_path, ord)
where not exists (
  select 1 from public.technologies t where lower(t.name) = lower(v.name)
);
