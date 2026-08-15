import { StyleSheet, View } from 'react-native';
import type { Achievement } from '../types/models';
import { colors } from '../theme';

interface Props {
  achievement: Achievement;
  unlocked: boolean;
  size: number;
}

export function AchievementIconBadge({ achievement, unlocked, size }: Props) {
  const Icon = achievement.icon;

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: unlocked ? achievement.color : colors.creamMuted2,
        },
        unlocked && [styles.badgeUnlocked, { shadowColor: achievement.color }],
      ]}
    >
      {unlocked ? (
        <View
          style={[
            styles.shine,
            { width: size * 0.6, height: size * 0.34, borderRadius: size * 0.3, top: size * 0.1 },
          ]}
        />
      ) : null}
      <Icon size={size * 0.5} color={unlocked ? colors.white : colors.textLight} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeUnlocked: {
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  shine: {
    position: 'absolute',
    backgroundColor: colors.white,
    opacity: 0.18,
  },
});
