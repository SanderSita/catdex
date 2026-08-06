-- CatDex schema: profiles, cats, sightings, unlocked_achievements.
-- Replaces the Firestore tree users/{uid}/{cats/{catId}/sightings/{sightingId},unlockedAchievements}.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'New Catcher',
  avatar_url text,
  joined_at timestamptz not null default now(),
  default_radius_km numeric not null default 3,
  notifications_enabled boolean not null default true,
  cats_found integer not null default 0,
  breeds_unlocked integer not null default 0,
  day_streak integer not null default 0
);

create table public.cats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Unnamed',
  breed_id text,
  breed_name text not null default 'Unknown',
  primary_photo_url text not null,
  geohash text not null,
  lat double precision not null,
  lng double precision not null,
  location_label text not null default '',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  sighting_count integer not null default 1
);
create index cats_user_geohash_idx on public.cats (user_id, geohash);

create table public.sightings (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.cats (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  photo_url text not null,
  geohash text not null,
  lat double precision not null,
  lng double precision not null,
  location_label text not null default '',
  captured_at timestamptz not null default now(),
  breed_guess text,
  breed_confidence numeric
);
create index sightings_cat_idx on public.sightings (cat_id);
create index sightings_user_idx on public.sightings (user_id);

create table public.unlocked_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- Row Level Security: owner-only access, scoped to auth.uid(). Mirrors firestore.rules.
alter table public.profiles enable row level security;
alter table public.cats enable row level security;
alter table public.sightings enable row level security;
alter table public.unlocked_achievements enable row level security;

create policy "select own profile" on public.profiles for select using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

create policy "select own cats" on public.cats for select using (auth.uid() = user_id);
create policy "insert own cats" on public.cats for insert with check (auth.uid() = user_id);
create policy "update own cats" on public.cats for update using (auth.uid() = user_id);

create policy "select own sightings" on public.sightings for select using (auth.uid() = user_id);
create policy "insert own sightings" on public.sightings for insert with check (auth.uid() = user_id);
-- No update/delete policy: sighting_count/last_seen_at on the parent cat are
-- corrected server-side by handle_new_sighting() (SECURITY DEFINER bypasses RLS).

create policy "select own unlocked achievements" on public.unlocked_achievements for select using (auth.uid() = user_id);
-- No insert policy for clients: only handle_new_sighting() (SECURITY DEFINER) unlocks these.

-- Denormalization + stats + achievements, replacing functions/src/triggers.ts (onSightingCreated).
create or replace function public.handle_new_sighting()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sighting_count integer;
  v_cats_found integer;
  v_breeds_unlocked integer;
  v_day_streak integer := 0;
  v_cursor date := (now() at time zone 'utc')::date;
begin
  select count(*) into v_sighting_count from public.sightings where cat_id = new.cat_id;
  update public.cats set sighting_count = v_sighting_count, last_seen_at = now() where id = new.cat_id;

  select count(*) into v_cats_found from public.cats where user_id = new.user_id;
  select count(distinct breed_id) into v_breeds_unlocked
    from public.cats where user_id = new.user_id and breed_id is not null;

  -- Longest run of consecutive days (including today) with at least one sighting.
  loop
    exit when not exists (
      select 1 from public.sightings
      where user_id = new.user_id and (captured_at at time zone 'utc')::date = v_cursor
    );
    v_day_streak := v_day_streak + 1;
    v_cursor := v_cursor - 1;
  end loop;

  update public.profiles
    set cats_found = v_cats_found, breeds_unlocked = v_breeds_unlocked, day_streak = v_day_streak
    where id = new.user_id;

  -- Mirrors src/data/achievements.ts / functions/src/achievements.ts thresholds.
  insert into public.unlocked_achievements (user_id, achievement_id)
  select new.user_id, t.id
  from (
    values
      ('first-catch', v_cats_found >= 1),
      ('breed-hunter', v_breeds_unlocked >= 5),
      ('explorer', v_cats_found >= 10),
      ('streak-7', v_day_streak >= 7),
      ('local-legend', v_cats_found >= 25)
  ) as t(id, earned)
  where t.earned
  on conflict (user_id, achievement_id) do nothing;

  return new;
end;
$$;

create trigger on_sighting_created
after insert on public.sightings
for each row execute function public.handle_new_sighting();

-- Storage: cat photos. Public read (the app and the classify-breed Edge
-- Function both need to fetch by plain URL); writes restricted to the
-- owner's `{uid}/...` folder. Mirrors storage.rules.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cat-photos', 'cat-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/heic', 'image/webp'])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "cat photos public read" on storage.objects
  for select using (bucket_id = 'cat-photos');

create policy "cat photos owner write" on storage.objects
  for insert with check (
    bucket_id = 'cat-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "cat photos owner update" on storage.objects
  for update using (
    bucket_id = 'cat-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "cat photos owner delete" on storage.objects
  for delete using (
    bucket_id = 'cat-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
