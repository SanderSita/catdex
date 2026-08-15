-- Preset avatars: users pick a cat icon + a color instead of uploading a
-- photo (no upload path, no moderation surface). avatar_url is left in
-- place but unused going forward — nothing has ever written to it.

alter table public.profiles add column avatar_icon text not null default 'happy';
alter table public.profiles add column avatar_color text not null default '#E8734F';

-- Expose the new fields alongside display_name/avatar_url wherever a
-- friend's profile preview is looked up. Return shape changed, so the old
-- functions must be dropped first (create or replace can't alter OUT params).
drop function if exists public.get_profile_preview(uuid);
drop function if exists public.lookup_friend_code(text);

create function public.get_profile_preview(p_user_id uuid)
returns table (display_name text, avatar_url text, avatar_icon text, avatar_color text)
language sql
stable
security definer
set search_path = public
as $$
  select display_name, avatar_url, avatar_icon, avatar_color from public.profiles where id = p_user_id;
$$;

create function public.lookup_friend_code(p_code text)
returns table (user_id uuid, display_name text, avatar_url text, avatar_icon text, avatar_color text)
language sql
stable
security definer
set search_path = public
as $$
  select id, display_name, avatar_url, avatar_icon, avatar_color from public.profiles where friend_code = upper(p_code);
$$;

grant execute on function public.get_profile_preview(uuid) to authenticated;
grant execute on function public.lookup_friend_code(text) to authenticated;
