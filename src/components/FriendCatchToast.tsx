import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useFriendActivityStore } from '../store/useFriendActivityStore';
import { getProfilePreview } from '../services/friendsService';
import { navigationRef } from '../navigation/navigationRef';
import { colors, fonts } from '../theme';

const DISPLAY_MS = 4000;
const ANIM_MS = 220;

/** Mounted once at the RootNavigator level so it can surface regardless of the active tab. */
export function FriendCatchToast() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const queue = useFriendActivityStore((s) => s.queue);
  const dismiss = useFriendActivityStore((s) => s.dismiss);
  const current = queue[0] ?? null;
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const translateY = useSharedValue(-120);

  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    setOwnerName(null);
    getProfilePreview(current.ownerUid).then((preview) => {
      if (!cancelled && preview) setOwnerName(preview.displayName);
    });

    translateY.value = withTiming(0, { duration: ANIM_MS });
    const hideTimer = setTimeout(() => {
      translateY.value = withTiming(-120, { duration: ANIM_MS });
    }, DISPLAY_MS);
    const dismissTimer = setTimeout(() => dismiss(current.id), DISPLAY_MS + ANIM_MS);

    return () => {
      cancelled = true;
      clearTimeout(hideTimer);
      clearTimeout(dismissTimer);
    };
  }, [current, dismiss, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  if (!current) return null;

  const onPress = () => {
    dismiss(current.id);
    if (navigationRef.isReady()) {
      navigationRef.navigate('FriendDetail', { friendUid: current.ownerUid, friendName: ownerName ?? undefined });
    }
  };

  return (
    <Animated.View style={[styles.wrap, { top: insets.top + 8 }, animatedStyle]} pointerEvents="box-none">
      <Pressable style={styles.card} onPress={onPress}>
        <Text style={styles.text} numberOfLines={2}>
          {t('toast.friendCaught', { name: ownerName ?? '…', breed: current.breedName })}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, zIndex: 100 },
  card: {
    backgroundColor: colors.teal,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  text: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.white },
});
