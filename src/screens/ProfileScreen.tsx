import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pencil } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { TabScreenProps } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../services/supabase';
import { updateAvatar, updateUserSettings, updateUsername, type UserProfile } from '../services/userService';
import { subscribeToUnlockedAchievements } from '../services/achievementsService';
import { ACHIEVEMENTS } from '../data/achievements';
import { AvatarThumb } from '../components/AvatarThumb';
import { StatTile } from '../components/StatTile';
import { AchievementBadge } from '../components/AchievementBadge';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';
import { EditUsernameModal } from '../components/EditUsernameModal';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { colors, fonts } from '../theme';

type Props = TabScreenProps<'Profile'>;

const RADIUS_CYCLE = [1, 3, 5, 10];

export function ProfileScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const uid = useAuthStore((s) => s.uid);
  const profile = useUserProfile(uid);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  type SettingsPatch = Partial<
    Pick<UserProfile, 'defaultRadiusKm' | 'notificationsEnabled' | 'friendNotificationsEnabled'>
  >;
  const [pendingSettings, setPendingSettings] = useState<SettingsPatch>({});

  useEffect(() => {
    if (!uid) return;
    return subscribeToUnlockedAchievements(uid, setUnlocked);
  }, [uid]);

  // Clear optimistic fields once the server-confirmed profile catches up, so a
  // rejected write doesn't leave the UI permanently out of sync.
  useEffect(() => {
    if (!profile) return;
    setPendingSettings((prev) => {
      const keys = Object.keys(prev) as (keyof SettingsPatch)[];
      const next = keys.reduce((acc, key) => {
        if (profile[key] !== prev[key]) acc[key] = prev[key] as never;
        return acc;
      }, {} as SettingsPatch);
      const changed = keys.some((key) => !(key in next));
      return changed ? next : prev;
    });
  }, [profile]);

  if (!profile) return <View style={styles.container} />;

  const displayProfile = { ...profile, ...pendingSettings };

  const joinedLabel = new Date(profile.joinedAt).toLocaleDateString(i18n.language === 'nl' ? 'nl-NL' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const applySetting = (patch: SettingsPatch) => {
    if (!uid) return;
    setPendingSettings((prev) => ({ ...prev, ...patch }));
    updateUserSettings(uid, patch).catch(() => {
      setPendingSettings((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(patch) as (keyof SettingsPatch)[]) delete next[key];
        return next;
      });
    });
  };

  const cycleRadius = () => {
    const next = RADIUS_CYCLE[(RADIUS_CYCLE.indexOf(displayProfile.defaultRadiusKm) + 1) % RADIUS_CYCLE.length];
    applySetting({ defaultRadiusKm: next });
  };

  const toggleNotifications = () => {
    applySetting({ notificationsEnabled: !displayProfile.notificationsEnabled });
  };

  const toggleFriendNotifications = () => {
    applySetting({ friendNotificationsEnabled: !displayProfile.friendNotificationsEnabled });
  };

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
        ListHeaderComponent={
        <View>
          <View style={styles.avatarSection}>
            <Pressable onPress={() => setEditingAvatar(true)} hitSlop={8}>
              <AvatarThumb icon={profile.avatarIcon} color={profile.avatarColor} size={88} />
            </Pressable>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{profile.displayName}</Text>
              <Pressable style={styles.editButton} onPress={() => setEditingUsername(true)} hitSlop={8}>
                <Pencil size={14} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.joined}>{t('profile.catchingSince', { date: joinedLabel })}</Text>
          </View>

          <View style={styles.statsRow}>
            <StatTile value={profile.stats.catsFound} label={t('profile.catsFound')} dark />
            <StatTile value={profile.stats.breedsUnlocked} label={t('profile.breeds')} dark />
            <StatTile value={profile.stats.dayStreak} label={t('profile.dayStreak')} dark />
          </View>

          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>{t('profile.achievements')}</Text>
            <View style={styles.achievementsGrid}>
              {ACHIEVEMENTS.map((a) => (
                <AchievementBadge key={a.id} achievement={a} unlocked={unlocked.has(a.id)} stats={profile.stats} />
              ))}
            </View>
          </View>

          <View style={styles.settingsSection}>
            <SettingsSection header={t('profile.settingsHeader')}>
              <SettingsRow
                title={t('profile.searchRadius')}
                detail={t('map.radiusOption', { km: displayProfile.defaultRadiusKm })}
                onPress={cycleRadius}
              />
              <SettingsRow
                title={t('profile.notifications')}
                detail={displayProfile.notificationsEnabled ? t('profile.on') : t('profile.off')}
                onPress={toggleNotifications}
              />
              <SettingsRow
                title={t('profile.friendNotifications')}
                detail={displayProfile.friendNotificationsEnabled ? t('profile.on') : t('profile.off')}
                onPress={toggleFriendNotifications}
              />
              <SettingsRow title={t('privacy.title')} onPress={() => navigation.navigate('Privacy')} />
              <SettingsRow title={t('profile.logOut')} chevron={false} isLast onPress={() => supabase.auth.signOut()} />
            </SettingsSection>
          </View>
        </View>
        }
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'x'}
      />
      <EditUsernameModal
        visible={editingUsername}
        currentName={profile.displayName}
        onSave={(name) => (uid ? updateUsername(uid, name) : Promise.resolve('invalid'))}
        onClose={() => setEditingUsername(false)}
      />
      <AvatarPickerModal
        visible={editingAvatar}
        currentIcon={profile.avatarIcon}
        currentColor={profile.avatarColor}
        onSave={(icon, color) => (uid ? updateAvatar(uid, icon, color) : Promise.resolve())}
        onClose={() => setEditingAvatar(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  avatarSection: { alignItems: 'center', gap: 10, paddingHorizontal: 20 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { fontFamily: fonts.headingSemi, fontSize: 18, color: colors.textDark },
  editButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.creamMuted,
  },
  joined: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 18 },
  achievementsSection: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.textDark, marginBottom: 10 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  settingsSection: { paddingHorizontal: 20, paddingTop: 22 },
});
