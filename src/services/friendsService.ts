import { supabase } from './supabase';
import type { CatRecord } from '../types/models';
import { mapCatRow, type CatRow } from './catsService';

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: number;
  respondedAt: number | null;
}

export interface ProfilePreview {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  responded_at: string | null;
}

function mapFriendshipRow(row: FriendshipRow): Friendship {
  return {
    id: row.id,
    requesterId: row.requester_id,
    addresseeId: row.addressee_id,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
    respondedAt: row.responded_at ? new Date(row.responded_at).getTime() : null,
  };
}

/** The counterpart uid in a friendship row, from the given user's perspective. */
export function otherUid(friendship: Friendship, uid: string): string {
  return friendship.requesterId === uid ? friendship.addresseeId : friendship.requesterId;
}

export function subscribeToFriendships(uid: string, onChange: (friendships: Friendship[]) => void) {
  const load = async () => {
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`);
    if (error) return;
    onChange((data as FriendshipRow[]).map(mapFriendshipRow));
  };
  load();

  // Two filters instead of one, unlike every other subscribeToX in this
  // codebase: a friendship row's user_id lives in either requester_id or
  // addressee_id depending on which side you're on, so one channel needs
  // both bindings to catch changes from either direction.
  const channel = supabase
    .channel(`friendships:${uid}:${Math.random().toString(36).slice(2)}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'friendships', filter: `requester_id=eq.${uid}` },
      load
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'friendships', filter: `addressee_id=eq.${uid}` },
      load
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export type SendFriendRequestResult = 'sent' | 'auto-accepted' | 'already-pending' | 'already-friends';

/** Inserts a pending request; auto-accepts if the target already sent one to us. */
export async function sendFriendRequest(uid: string, targetUid: string): Promise<SendFriendRequestResult> {
  const { error } = await supabase.from('friendships').insert({ requester_id: uid, addressee_id: targetUid });
  if (!error) return 'sent';

  // 23505 = unique_violation: a row for this pair already exists in either direction.
  if (error.code !== '23505') throw error;

  const { data: existing, error: fetchError } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(requester_id.eq.${uid},addressee_id.eq.${targetUid}),and(requester_id.eq.${targetUid},addressee_id.eq.${uid})`)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!existing) throw error;

  const row = existing as FriendshipRow;
  if (row.status === 'accepted') return 'already-friends';
  if (row.status === 'pending' && row.requester_id === targetUid) {
    await respondToFriendRequest(uid, row.id, true);
    return 'auto-accepted';
  }
  return 'already-pending';
}

export async function respondToFriendRequest(uid: string, friendshipId: string, accept: boolean): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: accept ? 'accepted' : 'declined', responded_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .eq('addressee_id', uid);
  if (error) throw error;
}

export async function cancelOrRemoveFriendship(friendshipId: string): Promise<void> {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
  if (error) throw error;
}

export async function lookupFriendCode(code: string): Promise<ProfilePreview | null> {
  const { data, error } = await supabase.rpc('lookup_friend_code', { p_code: code });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { userId: row.user_id, displayName: row.display_name, avatarUrl: row.avatar_url };
}

export async function getProfilePreview(userId: string): Promise<ProfilePreview | null> {
  const { data, error } = await supabase.rpc('get_profile_preview', { p_user_id: userId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { userId, displayName: row.display_name, avatarUrl: row.avatar_url };
}

export interface FriendCatchEvent {
  /** cats.id — used as the toast queue item key. */
  id: string;
  ownerUid: string;
  catId: string;
  catName: string;
  breedName: string;
  locationLabel: string;
  seenAt: number;
}

/**
 * Foreground-only complement to push notifications: fires on every new cat
 * a friend catches (INSERT only, not sighting updates) while this
 * subscription is alive. No Edge Function involved — pure Realtime.
 */
export function subscribeToFriendsCatchEvents(friendUids: string[], onCatch: (event: FriendCatchEvent) => void) {
  if (friendUids.length === 0) return () => {};

  const channel = supabase
    .channel(`friends-catch:${friendUids.join(',')}:${Math.random().toString(36).slice(2)}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'cats', filter: `user_id=in.(${friendUids.join(',')})` },
      (payload) => {
        const row = payload.new as CatRow;
        onCatch({
          id: row.id,
          ownerUid: row.user_id,
          catId: row.id,
          catName: row.name,
          breedName: row.breed_name,
          locationLabel: row.location_label,
          seenAt: Date.now(),
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Live-subscribes to accepted friends' cats, INSERT+UPDATE+DELETE, scoped to the given uids. */
export function subscribeToFriendsCats(friendUids: string[], onChange: (cats: CatRecord[]) => void) {
  if (friendUids.length === 0) {
    onChange([]);
    return () => {};
  }

  const load = async () => {
    const { data, error } = await supabase.from('cats').select('*').in('user_id', friendUids);
    if (error) return;
    onChange((data as CatRow[]).map(mapCatRow));
  };
  load();

  const channel = supabase
    .channel(`friends-cats:${friendUids.join(',')}:${Math.random().toString(36).slice(2)}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cats', filter: `user_id=in.(${friendUids.join(',')})` },
      load
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
