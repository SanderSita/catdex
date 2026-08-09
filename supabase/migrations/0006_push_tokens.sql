-- Expo push tokens, one row per device. Read only by the notify-friends
-- Edge Function via the service-role key (bypasses RLS) — no cross-user
-- policy is needed here, unlike cats/sightings/profiles.
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null,
  platform text,
  device_id text,
  updated_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);
create index push_tokens_user_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

create policy "select own push tokens" on public.push_tokens for select using (auth.uid() = user_id);
create policy "insert own push tokens" on public.push_tokens for insert with check (auth.uid() = user_id);
create policy "update own push tokens" on public.push_tokens for update using (auth.uid() = user_id);
create policy "delete own push tokens" on public.push_tokens for delete using (auth.uid() = user_id);
