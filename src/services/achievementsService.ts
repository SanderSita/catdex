import { supabase } from './supabase';

export function subscribeToUnlockedAchievements(uid: string, onChange: (unlockedIds: Set<string>) => void) {
  const load = async () => {
    const { data, error } = await supabase.from('unlocked_achievements').select('achievement_id').eq('user_id', uid);
    if (error) return;
    onChange(new Set(data.map((row: { achievement_id: string }) => row.achievement_id)));
  };
  load();

  const channel = supabase
    .channel(`unlocked-achievements:${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'unlocked_achievements', filter: `user_id=eq.${uid}` },
      load
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
