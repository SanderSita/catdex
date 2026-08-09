-- Unique, editable usernames. Default display_name becomes "NewCatcher" plus
-- 4 digits, generated the same retry-until-unique way friend codes are
-- (0005_friends.sql), so it can double as the identity shown to friends
-- without ever colliding with another user's.

-- Column had a literal default, so a BEFORE INSERT trigger would never see
-- NULL. Drop it so generation works the same way set_friend_code() does.
alter table public.profiles alter column display_name drop default;

-- Keep values sane at the DB layer regardless of client-side validation.
alter table public.profiles add constraint profiles_display_name_length check (char_length(display_name) between 3 and 20);

create or replace function public.generate_username()
returns text
language plpgsql
as $$
declare
  candidate text;
  tries integer := 0;
begin
  loop
    candidate := 'NewCatcher' || lpad(floor(random() * 10000)::int::text, 4, '0');
    exit when not exists (select 1 from public.profiles where lower(display_name) = lower(candidate));
    tries := tries + 1;
    if tries > 25 then
      raise exception 'Could not generate a unique username after % tries.', tries;
    end if;
  end loop;
  return candidate;
end;
$$;

create or replace function public.set_default_username()
returns trigger
language plpgsql
as $$
begin
  if new.display_name is null then
    new.display_name := public.generate_username();
  end if;
  return new;
end;
$$;

create trigger on_profile_insert_set_username
before insert on public.profiles
for each row execute function public.set_default_username();

-- Backfill existing rows still on the old literal default, one at a time so
-- each generate_username() call sees the previous row's new name (a single
-- set-based UPDATE would evaluate every call against the same pre-statement
-- snapshot and could hand out duplicates). Must run before the unique index
-- below, since multiple existing rows share the old 'New Catcher' default.
do $$
declare
  r record;
begin
  for r in select id from public.profiles where display_name = 'New Catcher' loop
    update public.profiles set display_name = public.generate_username() where id = r.id;
  end loop;
end $$;

-- Case-insensitive so "Sander" and "sander" can't coexist.
create unique index profiles_display_name_lower_idx on public.profiles (lower(display_name));
