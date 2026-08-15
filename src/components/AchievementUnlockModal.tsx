import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { tKey } from '../i18n';
import type { Achievement } from '../types/models';
import { PrimaryButton } from './PrimaryButton';
import { AchievementIconBadge } from './AchievementIconBadge';
import { colors, fonts } from '../theme';

const BADGE_SIZE = 96;
const BURST_SIZE = 176;
const RAY_COUNT = 8;
const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => i * (360 / RAY_COUNT));

interface Props {
  /** Newly-unlocked achievements to celebrate, in order. Shown one at a time. */
  queue: Achievement[];
  onDone: () => void;
}

export function AchievementUnlockModal({ queue, onDone }: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const burstScale = useSharedValue(0.3);
  const burstOpacity = useSharedValue(0);

  const current = queue[index] ?? null;

  useEffect(() => {
    if (!current) return;
    scale.value = 0.6;
    opacity.value = 0;
    scale.value = withSpring(1, { damping: 9, stiffness: 140 });
    opacity.value = withTiming(1, { duration: 200 });

    burstScale.value = 0.3;
    burstOpacity.value = 0;
    burstScale.value = withTiming(1.3, { duration: 500 });
    burstOpacity.value = withSequence(withTiming(0.55, { duration: 150 }), withTiming(0, { duration: 450 }));
  }, [current, scale, opacity, burstScale, burstOpacity]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: burstScale.value }],
    opacity: burstOpacity.value,
  }));

  if (!current) return null;

  const isLast = index === queue.length - 1;
  const onNext = () => {
    if (isLast) {
      onDone();
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onNext}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{t('achievementUnlock.title')}</Text>
          <View style={styles.badgeStack}>
            <Animated.View style={[styles.burst, burstStyle]}>
              {RAYS.map((deg) => (
                <View
                  key={deg}
                  style={[
                    styles.ray,
                    { backgroundColor: current.color, transform: [{ rotate: `${deg}deg` }, { translateY: -BURST_SIZE / 2 }] },
                  ]}
                />
              ))}
            </Animated.View>
            <Animated.View style={badgeStyle}>
              <AchievementIconBadge achievement={current} unlocked size={BADGE_SIZE} />
            </Animated.View>
          </View>
          <Text style={styles.label}>{tKey(t, `achievements.${current.id}`)}</Text>
          {queue.length > 1 ? (
            <Text style={styles.progress}>
              {t('achievementUnlock.progress', { current: index + 1, total: queue.length })}
            </Text>
          ) : null}
          <PrimaryButton
            label={isLast ? t('achievementUnlock.nice') : t('achievementUnlock.next')}
            onPress={onNext}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.coral,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeStack: {
    width: BURST_SIZE,
    height: BURST_SIZE,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burst: {
    position: 'absolute',
    width: BURST_SIZE,
    height: BURST_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 5,
    height: 26,
    borderRadius: 3,
  },
  label: {
    fontFamily: fonts.headingSemi,
    fontSize: 20,
    color: colors.textDark,
    marginTop: 16,
    textAlign: 'center',
  },
  progress: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  button: {
    marginTop: 22,
    width: '100%',
  },
});
