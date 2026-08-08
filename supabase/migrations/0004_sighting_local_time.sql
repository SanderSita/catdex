-- captured_at is server UTC, which can't tell whether a sighting happened at
-- dusk/dawn or on a weekend *for the user*. The client stamps its own local
-- clock at capture time (same trust model as lat/lng, which are equally
-- client-supplied already). Nullable: existing rows just don't count toward
-- these achievements.
alter table public.sightings add column captured_local_hour smallint check (captured_local_hour between 0 and 23);
alter table public.sightings add column captured_local_weekday smallint check (captured_local_weekday between 0 and 6);

-- Restates the full body of handle_new_sighting() from 0001_init.sql (Postgres
-- replaces functions wholesale, not by diff) with one addition: a real
-- night-owl condition, replacing the dead `check: () => false` stub that
-- previously lived only in src/data/achievements.ts and could never unlock.
-- Any future edit to this function must restate the full cumulative body.
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
  v_night_owl boolean;
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

  select exists(
    select 1 from public.sightings
    where user_id = new.user_id
      and captured_local_hour is not null
      and (captured_local_hour >= 21 or captured_local_hour < 5)
  ) into v_night_owl;

  update public.profiles
    set cats_found = v_cats_found, breeds_unlocked = v_breeds_unlocked, day_streak = v_day_streak
    where id = new.user_id;

  -- Mirrors src/data/achievements.ts thresholds.
  insert into public.unlocked_achievements (user_id, achievement_id)
  select new.user_id, t.id
  from (
    values
      ('first-catch', v_cats_found >= 1),
      ('breed-hunter', v_breeds_unlocked >= 5),
      ('explorer', v_cats_found >= 10),
      ('streak-7', v_day_streak >= 7),
      ('local-legend', v_cats_found >= 25),
      ('night-owl', v_night_owl)
  ) as t(id, earned)
  where t.earned
  on conflict (user_id, achievement_id) do nothing;

  return new;
end;
$$;
