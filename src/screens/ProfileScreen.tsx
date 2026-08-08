import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabScreenProps } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../services/supabase';
import { updateUserSettings } from '../services/userService';
import { subscribeToUnlockedAchievements } from '../services/achievementsService';
import { ACHIEVEMENTS } from '../data/achievements';
import { CatThumb } from '../components/CatThumb';
import { StatTile } from '../components/StatTile';
import { AchievementBadge } from '../components/AchievementBadge';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';
import { colors, fonts } from '../theme';

type Props = TabScreenProps<'Profile'>;

const RADIUS_CYCLE = [1, 3, 5, 10];

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const uid = useAuthStore((s) => s.uid);
  const profile = useUserProfile(uid);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!uid) return;
    return subscribeToUnlockedAchievements(uid, setUnlocked);
  }, [uid]);

  if (!profile) return <View style={styles.container} />;

  const joinedLabel = new Date(profile.joinedAt).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const cycleRadius = () => {
    if (!uid) return;
    const next = RADIUS_CYCLE[(RADIUS_CYCLE.indexOf(profile.defaultRadiusKm) + 1) % RADIUS_CYCLE.length];
    updateUserSettings(uid, { defaultRadiusKm: next });
  };

  const toggleNotifications = () => {
    if (!uid) return;
    updateUserSettings(uid, { notificationsEnabled: !profile.notificationsEnabled });
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
      ListHeaderComponent={
        <View>
          <View style={styles.avatarSection}>
            <CatThumb uri={profile.avatarUrl} shape="circle" size={88} />
            <Text style={styles.username}>{profile.displayName}</Text>
            <Text style={styles.joined}>Catching since {joinedLabel}</Text>
          </View>

          <View style={styles.statsRow}>
            <StatTile value={profile.stats.catsFound} label="Cats found" dark />
            <StatTile value={profile.stats.breedsUnlocked} label="Breeds" dark />
            <StatTile value={profile.stats.dayStreak} label="Day streak" dark />
          </View>

          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {ACHIEVEMENTS.map((a) => (
                <AchievementBadge key={a.id} achievement={a} unlocked={unlocked.has(a.id)} stats={profile.stats} />
              ))}
            </View>
          </View>

          <View style={styles.settingsSection}>
            <SettingsSection header="Settings">
              <SettingsRow title="Default search radius" detail={`${profile.defaultRadiusKm} km`} onPress={cycleRadius} />
              <SettingsRow
                title="Notifications"
                detail={profile.notificationsEnabled ? 'On' : 'Off'}
                onPress={toggleNotifications}
              />
              <SettingsRow title="Privacy" onPress={() => navigation.navigate('Privacy')} />
              <SettingsRow title="Log out" chevron={false} isLast onPress={() => supabase.auth.signOut()} />
            </SettingsSection>
          </View>
        </View>
      }
      data={[]}
      renderItem={() => null}
      keyExtractor={() => 'x'}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  avatarSection: { alignItems: 'center', gap: 10, paddingHorizontal: 20 },
  username: { fontFamily: fonts.headingSemi, fontSize: 18, color: colors.textDark },
  joined: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 18 },
  achievementsSection: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.textDark, marginBottom: 10 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  settingsSection: { paddingHorizontal: 20, paddingTop: 22 },
});
