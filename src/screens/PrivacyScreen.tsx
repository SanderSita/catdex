import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { updateUserSettings } from '../services/userService';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';
import { colors, fonts } from '../theme';

export function PrivacyScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const uid = useAuthStore((s) => s.uid);
  const profile = useUserProfile(uid);
  const [pendingIsPrivate, setPendingIsPrivate] = useState<boolean | null>(null);

  // Clear the optimistic value once the server-confirmed profile catches up,
  // so a rejected write doesn't leave the toggle permanently out of sync.
  useEffect(() => {
    if (profile && pendingIsPrivate !== null && profile.isPrivate === pendingIsPrivate) {
      setPendingIsPrivate(null);
    }
  }, [profile, pendingIsPrivate]);

  const isPrivate = pendingIsPrivate ?? profile?.isPrivate ?? false;

  const toggle = () => {
    if (!uid) return;
    const next = !isPrivate;
    setPendingIsPrivate(next);
    updateUserSettings(uid, { isPrivate: next }).catch(() => setPendingIsPrivate(!next));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>{t('privacy.title')}</Text>
      <Text style={styles.body}>{isPrivate ? t('privacy.bodyPrivate') : t('privacy.bodyPublic')}</Text>
      <View style={styles.settingsSection}>
        <SettingsSection header={t('privacy.settingsHeader')}>
          <SettingsRow
            title={t('privacy.privateProfile')}
            detail={isPrivate ? t('privacy.private') : t('privacy.public')}
            onPress={toggle}
            isLast
          />
        </SettingsSection>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  title: { fontFamily: fonts.headingSemi, fontSize: 22, color: colors.textDark, marginBottom: 12 },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.textMid, lineHeight: 20 },
  settingsSection: { paddingTop: 22 },
});
