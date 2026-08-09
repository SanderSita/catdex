// Deno Edge Function. Fired by a Supabase Database Webhook on `cats` INSERT
// (a genuinely new cat, not a repeat sighting). Notifies the catcher's
// accepted friends who have friend_notifications_enabled via Expo push.
//
// Unlike classify-breed, this isn't called with a user JWT — it's called by
// the Database Webhook, authenticated instead via a shared secret header.
// Uses the service-role key to bypass RLS entirely, since there is no user
// session to scope queries to.
//
// Setup (per environment, not committed as SQL — see README note below):
// Supabase Dashboard → Database → Webhooks → table `cats`, event INSERT,
// target this function's URL, header `x-webhook-secret: <NOTIFY_FRIENDS_WEBHOOK_SECRET>`.
// Also set secrets: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... NOTIFY_FRIENDS_WEBHOOK_SECRET=...`
// (SUPABASE_URL and SUPABASE_ANON_KEY are already provided by the platform;
// SUPABASE_SERVICE_ROLE_KEY is not auto-injected and must be set explicitly.)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const WEBHOOK_SECRET = Deno.env.get('NOTIFY_FRIENDS_WEBHOOK_SECRET') ?? '';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_PUSH_BATCH_SIZE = 100;

interface CatRow {
  id: string;
  user_id: string;
  name: string;
  breed_name: string;
  location_label: string;
}

interface WebhookPayload {
  type?: string;
  table?: string;
  record?: CatRow;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }
  if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }
  if (payload.table !== 'cats' || payload.type !== 'INSERT' || !payload.record) {
    return json({ ok: true, skipped: true });
  }
  const cat = payload.record;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${cat.user_id},addressee_id.eq.${cat.user_id}`);
    if (friendshipsError) throw friendshipsError;

    const friendIds = (friendships ?? [])
      .map((f: { requester_id: string; addressee_id: string }) =>
        f.requester_id === cat.user_id ? f.addressee_id : f.requester_id
      )
      .filter((id: string) => id !== cat.user_id);
    if (friendIds.length === 0) return json({ ok: true, notified: 0 });

    const { data: notifiableProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', friendIds)
      .eq('friend_notifications_enabled', true);
    if (profilesError) throw profilesError;
    if (!notifiableProfiles || notifiableProfiles.length === 0) return json({ ok: true, notified: 0 });

    const notifiableIds = notifiableProfiles.map((p: { id: string }) => p.id);

    const { data: tokenRows, error: tokensError } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .in('user_id', notifiableIds);
    if (tokensError) throw tokensError;

    const tokens = Array.from(new Set((tokenRows ?? []).map((t: { expo_push_token: string }) => t.expo_push_token)));
    if (tokens.length === 0) return json({ ok: true, notified: 0 });

    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', cat.user_id)
      .maybeSingle();
    const ownerName = ownerProfile?.display_name || 'A friend';

    const messages = tokens.map((to) => ({
      to,
      title: `${ownerName} caught a new cat!`,
      body: `${cat.name} (${cat.breed_name})${cat.location_label ? ` near ${cat.location_label}` : ''}`,
      data: { kind: 'friend-catch', friendUid: cat.user_id, catId: cat.id },
    }));

    for (let i = 0; i < messages.length; i += EXPO_PUSH_BATCH_SIZE) {
      const batch = messages.slice(i, i + EXPO_PUSH_BATCH_SIZE);
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(batch),
      });
      if (!response.ok) {
        console.error('[notify-friends] Expo push batch failed:', response.status, await response.text());
      }
    }

    return json({ ok: true, notified: tokens.length });
  } catch (err) {
    console.error('[notify-friends] error:', err);
    return json({ error: err instanceof Error ? err.message : 'notify-friends failed.' }, 500);
  }
});
