import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, UserPlus, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { TabScreenProps } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { useFriendsStore } from '../store/useFriendsStore';
import { useUserCats } from '../hooks/useUserCats';
import {
  respondToFriendRequest,
  getProfilePreview,
  otherUid,
  type ProfilePreview,
} from '../services/friendsService';
import { AvatarThumb } from '../components/AvatarThumb';
import { colors, fonts } from '../theme';

type Props = TabScreenProps<'Friends'>;

function FriendRow({ friendUid, preview, onPress }: { friendUid: string; preview?: ProfilePreview; onPress: () => void }) {
  const { t } = useTranslation();
  const cats = useUserCats(friendUid);
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <AvatarThumb icon={preview?.avatarIcon} color={preview?.avatarColor} size={44} />
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{preview?.displayName ?? '…'}</Text>
        <Text style={styles.rowDetail}>{t('friends.catsCount', { count: cats.length })}</Text>
      </View>
    </Pressable>
  );
}

function RequestRow({
  friendUid,
  preview,
  onAccept,
  onDecline,
}: {
  friendUid: string;
  preview?: ProfilePreview;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <AvatarThumb icon={preview?.avatarIcon} color={preview?.avatarColor} size={44} />
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{preview?.displayName ?? '…'}</Text>
        <Text style={styles.rowDetail}>{t('friends.pendingBadge')}</Text>
      </View>
      <View style={styles.requestActions}>
        <Pressable style={[styles.iconButton, styles.declineButton]} onPress={onDecline}>
          <X size={16} color={colors.textMid} />
        </Pressable>
        <Pressable style={[styles.iconButton, styles.acceptButton]} onPress={onAccept}>
          <Check size={16} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

export function FriendsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const uid = useAuthStore((s) => s.uid);
  const friendships = useFriendsStore((s) => s.friendships);
  const [previews, setPreviews] = useState<Record<string, ProfilePreview>>({});
  const requestedRef = useRef<Set<string>>(new Set());

  const incoming = useMemo(
    () => friendships.filter((f) => f.status === 'pending' && f.addresseeId === uid),
    [friendships, uid]
  );
  const accepted = useMemo(() => friendships.filter((f) => f.status === 'accepted'), [friendships]);

  useEffect(() => {
    if (!uid) return;
    const uids = new Set([...incoming, ...accepted].map((f) => otherUid(f, uid)));
    uids.forEach((otherId) => {
      if (requestedRef.current.has(otherId)) return;
      requestedRef.current.add(otherId);
      getProfilePreview(otherId).then((preview) => {
        if (preview) setPreviews((prev) => ({ ...prev, [otherId]: preview }));
      });
    });
  }, [incoming, accepted, uid]);

  if (!uid) return <View style={styles.container} />;

  const openFriend = (friendUid: string) => {
    navigation.navigate('FriendDetail', { friendUid, friendName: previews[friendUid]?.displayName });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('friends.title')}</Text>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddFriend')}>
          <UserPlus size={18} color={colors.white} />
        </Pressable>
      </View>

      {incoming.length === 0 && accepted.length === 0 ? (
        <Text style={styles.emptyText}>{t('friends.empty')}</Text>
      ) : (
        <View style={styles.scroll}>
          {incoming.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('friends.requestsSection')}</Text>
              {incoming.map((f) => (
                <RequestRow
                  key={f.id}
                  friendUid={otherUid(f, uid)}
                  preview={previews[otherUid(f, uid)]}
                  onAccept={() => respondToFriendRequest(uid, f.id, true)}
                  onDecline={() => respondToFriendRequest(uid, f.id, false)}
                />
              ))}
            </View>
          ) : null}

          {accepted.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('friends.friendsSection')}</Text>
              {accepted.map((f) => {
                const friendUid = otherUid(f, uid);
                return (
                  <FriendRow
                    key={f.id}
                    friendUid={friendUid}
                    preview={previews[friendUid]}
                    onPress={() => openFriend(friendUid)}
                  />
                );
              })}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontFamily: fonts.headingSemi, fontSize: 24, color: colors.textDark },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 20 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.creamMuted2,
  },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textDark },
  rowDetail: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  declineButton: { backgroundColor: colors.creamMuted },
  acceptButton: { backgroundColor: colors.teal },
  emptyText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
});
