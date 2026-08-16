import { supabase } from './supabase';
import type { UserStats } from '../types/models';
import { DEFAULT_AVATAR_COLOR, DEFAULT_AVATAR_ICON, isCatIconId, type CatIconId } from '../data/avatars';

export interface UserProfile {
  displayName: string;
  avatarUrl: string | null;
  avatarIcon: CatIconId;
  avatarColor: string;
  joinedAt: number;
  defaultRadiusKm: number;
  notificationsEnabled: boolean;
  friendCode: string | null;
  friendNotificationsEnabled: boolean;
  isPrivate: boolean;
  stats: UserStats;
}

interface ProfileRow {
  display_name: string;
  avatar_url: string | null;
  avatar_icon: string;
  avatar_color: string;
  joined_at: string;
  default_radius_km: number;
  notifications_enabled: boolean;
  friend_code: string | null;
  friend_notifications_enabled: boolean;
  is_private: boolean;
  cats_found: number;
  breeds_unlocked: number;
  day_streak: number;
}

function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    avatarIcon: isCatIconId(row.avatar_icon) ? row.avatar_icon : DEFAULT_AVATAR_ICON,
    avatarColor: row.avatar_color || DEFAULT_AVATAR_COLOR,
    joinedAt: new Date(row.joined_at).getTime(),
    defaultRadiusKm: row.default_radius_km,
    notificationsEnabled: row.notifications_enabled,
    friendCode: row.friend_code,
    friendNotificationsEnabled: row.friend_notifications_enabled,
    isPrivate: row.is_private,
    stats: {
      catsFound: row.cats_found,
      breedsUnlocked: row.breeds_unlocked,
      dayStreak: row.day_streak,
    },
  };
}

export async function ensureUserProfile(uid: string): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({ id: uid }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw error;
}

export function subscribeToUserProfile(uid: string, onChange: (profile: UserProfile | null) => void) {
  const load = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) return;
    onChange(data ? mapProfileRow(data as ProfileRow) : null);
  };
  load();

  const channel = supabase
    .channel(`profile:${uid}:${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export type UpdateUsernameResult = 'ok' | 'taken' | 'invalid';

export async function updateUsername(uid: string, displayName: string): Promise<UpdateUsernameResult> {
  const trimmed = displayName.trim();
  if (trimmed.length < 3 || trimmed.length > 20) return 'invalid';

  const { error } = await supabase.from('profiles').update({ display_name: trimmed }).eq('id', uid);
  if (error) {
    // 23505 = unique_violation: another profile already has this name (case-insensitive).
    if (error.code === '23505') return 'taken';
    throw error;
  }
  return 'ok';
}

export async function updateAvatar(uid: string, icon: CatIconId, color: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ avatar_icon: icon, avatar_color: color }).eq('id', uid);
  if (error) throw error;
}

export async function updateUserSettings(
  uid: string,
  patch: Partial<
    Pick<UserProfile, 'defaultRadiusKm' | 'notificationsEnabled' | 'friendNotificationsEnabled' | 'isPrivate'>
  >
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(patch.defaultRadiusKm !== undefined && { default_radius_km: patch.defaultRadiusKm }),
      ...(patch.notificationsEnabled !== undefined && { notifications_enabled: patch.notificationsEnabled }),
      ...(patch.friendNotificationsEnabled !== undefined && {
        friend_notifications_enabled: patch.friendNotificationsEnabled,
      }),
      ...(patch.isPrivate !== undefined && { is_private: patch.isPrivate }),
    })
    .eq('id', uid);
  if (error) throw error;
}
