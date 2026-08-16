import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tKey } from '../i18n';
import type { Achievement } from '../types/models';
import { PrimaryButton } from './PrimaryButton';
import { AchievementIconBadge } from './AchievementIconBadge';
import { CelebrationBurst } from './CelebrationBurst';
import { colors, fonts, shadows } from '../theme';
import * as haptics from '../utils/haptics';

const BADGE_SIZE = 96;

interface Props {
  /** Newly-unlocked achievements to celebrate, in order. Shown one at a time. */
  queue: Achievement[];
  onDone: () => void;
}

export function AchievementUnlockModal({ queue, onDone }: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const current = queue[index] ?? null;

  useEffect(() => {
    if (current) haptics.success();
  }, [current]);

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
            <CelebrationBurst color={current.color} size={BADGE_SIZE} replayKey={current.id}>
              <AchievementIconBadge achievement={current} unlocked size={BADGE_SIZE} />
            </CelebrationBurst>
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
    ...shadows.floating,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.coral,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeStack: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
