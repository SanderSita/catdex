import { supabase } from './supabase';
import type { UserStats } from '../types/models';

export interface UserProfile {
  displayName: string;
  avatarUrl: string | null;
  joinedAt: number;
  defaultRadiusKm: number;
  notificationsEnabled: boolean;
  stats: UserStats;
}

interface ProfileRow {
  display_name: string;
  avatar_url: string | null;
  joined_at: string;
  default_radius_km: number;
  notifications_enabled: boolean;
  cats_found: number;
  breeds_unlocked: number;
  day_streak: number;
}

function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    joinedAt: new Date(row.joined_at).getTime(),
    defaultRadiusKm: row.default_radius_km,
    notificationsEnabled: row.notifications_enabled,
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
    .channel(`profile:${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function updateUserSettings(uid: string, patch: Partial<Pick<UserProfile, 'defaultRadiusKm' | 'notificationsEnabled'>>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(patch.defaultRadiusKm !== undefined && { default_radius_km: patch.defaultRadiusKm }),
      ...(patch.notificationsEnabled !== undefined && { notifications_enabled: patch.notificationsEnabled }),
    })
    .eq('id', uid);
  if (error) throw error;
}
