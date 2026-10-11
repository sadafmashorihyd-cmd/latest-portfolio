-- Run this once in Supabase: SQL Editor > New query > paste > Run.
-- (If you already ran an older version of this file, first run:  drop table public.reviews;  then run this.)

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  country    text not null,
  title      text not null,
  review     text not null,
  email      text not null,            -- private: only you can see it, never shown on the site
  linkedin   text,                     -- optional, shown on the site if the reviewer added it
  photo      text not null,            -- small JPEG (data URL)
  approved   boolean not null default false
);

alter table public.reviews enable row level security;

-- Visitors' browsers may read ONLY approved reviews, and ONLY the public columns.
-- Nobody can read the private "email" column or write to this table from the browser.
-- (Writing happens only through api/review.js, which uses the secret service key.)
revoke all on public.reviews from anon, authenticated;
grant all on public.reviews to service_role;   -- the website's server function (api/review.js) uses this role
grant select (id, created_at, name, country, title, review, photo, linkedin, approved) on public.reviews to anon;

drop policy if exists "public can read approved reviews" on public.reviews;
create policy "public can read approved reviews"
  on public.reviews for select to anon
  using (approved = true);