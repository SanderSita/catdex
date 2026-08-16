import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share2, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { lookupFriendCode, sendFriendRequest, type ProfilePreview } from '../services/friendsService';
import { AvatarThumb } from '../components/AvatarThumb';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFriend'>;

export function AddFriendScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const uid = useAuthStore((s) => s.uid);
  const profile = useUserProfile(uid);

  const [code, setCode] = useState(route.params?.prefillCode?.toUpperCase() ?? '');
  const [looking, setLooking] = useState(false);
  const [found, setFound] = useState<ProfilePreview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const runLookup = async (value: string) => {
    if (!uid || !value.trim()) return;
    setLooking(true);
    setError(null);
    setFound(null);
    setMessage(null);
    try {
      const preview = await lookupFriendCode(value.trim());
      if (!preview) {
        setError(t('addFriend.notFound'));
      } else if (preview.userId === uid) {
        setError(t('addFriend.ownCode'));
      } else {
        setFound(preview);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('addFriend.notFound'));
    } finally {
      setLooking(false);
    }
  };

  useEffect(() => {
    if (route.params?.prefillCode) runLookup(route.params.prefillCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.prefillCode]);

  const onSend = async () => {
    if (!uid || !found) return;
    setSending(true);
    setError(null);
    try {
      const result = await sendFriendRequest(uid, found.userId);
      if (result === 'auto-accepted') {
        setMessage(t('addFriend.autoAccepted', { name: found.displayName }));
      } else if (result === 'already-friends') {
        setError(t('addFriend.alreadyFriends'));
      } else if (result === 'already-pending') {
        setError(t('addFriend.alreadyPending'));
      } else {
        setMessage(t('addFriend.requestSent'));
      }
      setFound(null);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('addFriend.notFound'));
    } finally {
      setSending(false);
    }
  };

  const onShare = () => {
    if (!profile?.friendCode) return;
    Share.share({ message: t('addFriend.shareMessage', { code: profile.friendCode }) });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
          <X size={18} color={colors.textMid} />
        </Pressable>
        <Text style={styles.title}>{t('addFriend.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>{t('addFriend.yourCode')}</Text>
        <View style={styles.codeCard}>
          <Text style={styles.codeText}>{profile?.friendCode ?? '——————'}</Text>
          <Pressable style={styles.shareButton} onPress={onShare} disabled={!profile?.friendCode}>
            <Share2 size={16} color={colors.white} />
            <Text style={styles.shareButtonText}>{t('addFriend.share')}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>{t('addFriend.enterCode')}</Text>
        <View style={styles.enterRow}>
          <TextInput
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase())}
            placeholder={t('addFriend.codePlaceholder')}
            placeholderTextColor={colors.textLight}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7}
            style={styles.codeInput}
          />
          <Pressable style={styles.findButton} onPress={() => runLookup(code)} disabled={!code.trim() || looking}>
            {looking ? <ActivityIndicator color={colors.white} /> : <Text style={styles.findButtonText}>{t('addFriend.send')}</Text>}
          </Pressable>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {message ? <Text style={styles.successText}>{message}</Text> : null}

      {found ? (
        <View style={styles.section}>
          <View style={styles.confirmCard}>
            <AvatarThumb icon={found.avatarIcon} color={found.avatarColor} size={56} />
            <Text style={styles.confirmTitle}>{t('addFriend.confirmTitle', { name: found.displayName })}</Text>
            <PrimaryButton label={t('addFriend.sendRequest')} onPress={onSend} disabled={sending} style={{ width: '100%' }} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.creamMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { width: 36, height: 36 },
  title: { fontFamily: fonts.headingSemi, fontSize: 18, color: colors.textDark },
  section: { paddingHorizontal: 20, paddingTop: 18 },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textMid, marginBottom: 8 },
  codeCard: {
    backgroundColor: colors.tealBgSoft,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: { fontFamily: fonts.headingSemi, fontSize: 22, letterSpacing: 2, color: colors.tealHeading },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.teal,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  shareButtonText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.white },
  enterRow: { flexDirection: 'row', gap: 10 },
  codeInput: {
    flex: 1,
    backgroundColor: colors.creamMuted,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    letterSpacing: 1,
    color: colors.textDark,
  },
  findButton: {
    backgroundColor: colors.coral,
    borderRadius: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findButtonText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.white },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 13, paddingHorizontal: 20, paddingTop: 12 },
  successText: { color: colors.teal, fontFamily: fonts.bodySemi, fontSize: 13, paddingHorizontal: 20, paddingTop: 12 },
  confirmCard: {
    backgroundColor: colors.creamMuted,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  confirmTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.textDark, textAlign: 'center' },
});
