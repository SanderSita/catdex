-- Friends: request/accept friendships, a shareable friend code, and the
-- cross-user RLS needed for a friend to see another user's cats/sightings.
-- Auth is anonymous-only (no email/username), so friend codes are the only
-- way to find another user.

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  addressee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_not_self check (requester_id <> addressee_id)
);

-- One row per unordered pair, regardless of who requested — prevents a
-- reverse-duplicate request once one direction already exists.
create unique index friendships_unique_pair_idx on public.friendships (
  least(requester_id, addressee_id), greatest(requester_id, addressee_id)
);
create index friendships_addressee_idx on public.friendships (addressee_id, status);
create index friendships_requester_idx on public.friendships (requester_id, status);

alter table public.friendships enable row level security;

create policy "select own friendships" on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "insert own friend request" on public.friendships
  for insert with check (auth.uid() = requester_id);

-- Only the addressee can accept/decline; the requester can't self-approve.
create policy "addressee responds to friend request" on public.friendships
  for update
  using (auth.uid() = addressee_id)
  with check (auth.uid() = addressee_id and status in ('accepted', 'declined'));

-- Either party can delete: cancel a pending request, or unfriend later.
create policy "either party removes friendship" on public.friendships
  for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Friend code: short, human-shareable, generated server-side so collisions
-- are handled centrally rather than trusting the client to retry.
alter table public.profiles add column friend_code text unique;
alter table public.profiles add column friend_notifications_enabled boolean not null default true;

create or replace function public.generate_friend_code()
returns text
language plpgsql
as $$
declare
  -- No 0/O/1/I/L: avoids visually-ambiguous characters in a code meant to be
  -- read aloud or typed by hand.
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  tries integer := 0;
begin
  loop
    code := '';
    for i in 1..7 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where friend_code = code);
    tries := tries + 1;
    if tries > 25 then
      raise exception 'Could not generate a unique friend code after % tries.', tries;
    end if;
  end loop;
  return code;
end;
$$;

create or replace function public.set_friend_code()
returns trigger
language plpgsql
as $$
begin
  if new.friend_code is null then
    new.friend_code := public.generate_friend_code();
  end if;
  return new;
end;
$$;

create trigger on_profile_insert_set_friend_code
before insert on public.profiles
for each row execute function public.set_friend_code();

update public.profiles set friend_code = public.generate_friend_code() where friend_code is null;

-- SECURITY DEFINER helpers: `cats`/`sightings`/`profiles` RLS can't safely
-- subquery `friendships` inline in a way that stays readable, so these
-- centralize the "are these two users friends" check.
create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester_id = a and addressee_id = b) or (requester_id = b and addressee_id = a))
  );
$$;

-- Minimal, non-sensitive profile lookup by uid — used to show a requester's
-- name/avatar on a pending friend request, without exposing the full
-- profiles row (stats, radius, etc.) before the request is accepted.
create or replace function public.get_profile_preview(p_user_id uuid)
returns table (display_name text, avatar_url text)
language sql
stable
security definer
set search_path = public
as $$
  select display_name, avatar_url from public.profiles where id = p_user_id;
$$;

-- The only way to resolve a friend code to a uid, since raw `profiles`
-- select is owner/friend-scoped only.
create or replace function public.lookup_friend_code(p_code text)
returns table (user_id uuid, display_name text, avatar_url text)
language sql
stable
security definer
set search_path = public
as $$
  select id, display_name, avatar_url from public.profiles where friend_code = upper(p_code);
$$;

grant execute on function public.are_friends(uuid, uuid) to authenticated;
grant execute on function public.get_profile_preview(uuid) to authenticated;
grant execute on function public.lookup_friend_code(text) to authenticated;

-- Additive SELECT policies (Postgres ORs multiple permissive policies
-- together — the existing owner-only policies from 0001_init.sql are
-- untouched). Accepted friends only; full profiles row, not just the preview.
create policy "select friends cats" on public.cats
  for select using (public.are_friends(auth.uid(), user_id));

create policy "select friends sightings" on public.sightings
  for select using (public.are_friends(auth.uid(), user_id));

create policy "select friends profiles" on public.profiles
  for select using (public.are_friends(auth.uid(), id));
