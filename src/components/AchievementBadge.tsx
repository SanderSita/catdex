import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { Achievement, UserStats } from '../types/models';
import { colors, fonts } from '../theme';

const BADGE_SIZE = 52;
const RING_STROKE = 4;
const RING_GAP = 5;
const OUTER_SIZE = BADGE_SIZE + (RING_GAP + RING_STROKE) * 2;
const RING_RADIUS = (OUTER_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface Props {
  achievement: Achievement;
  unlocked: boolean;
  stats: UserStats;
}

export function AchievementBadge({ achievement, unlocked, stats }: Props) {
  const progress = unlocked ? 1 : achievement.progress ? Math.max(0, Math.min(1, achievement.progress(stats))) : 0;
  const showRing = !unlocked && Boolean(achievement.progress);

  return (
    <View style={styles.cell}>
      <View style={styles.stack}>
        {showRing ? (
          <Svg width={OUTER_SIZE} height={OUTER_SIZE} style={styles.ring}>
            <Circle
              cx={OUTER_SIZE / 2}
              cy={OUTER_SIZE / 2}
              r={RING_RADIUS}
              stroke={colors.creamMuted2}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={OUTER_SIZE / 2}
              cy={OUTER_SIZE / 2}
              r={RING_RADIUS}
              stroke={achievement.color}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              fill="none"
              rotation={-90}
              originX={OUTER_SIZE / 2}
              originY={OUTER_SIZE / 2}
            />
          </Svg>
        ) : null}
        <View
          style={[
            styles.circle,
            { backgroundColor: achievement.color, opacity: unlocked ? 1 : 0.3 },
          ]}
        />
      </View>
      <Text style={styles.label}>{achievement.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { width: '30%', alignItems: 'center', gap: 6 },
  stack: { width: OUTER_SIZE, height: OUTER_SIZE, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  circle: { width: BADGE_SIZE, height: BADGE_SIZE, borderRadius: BADGE_SIZE / 2 },
  label: { fontFamily: fonts.bodySemi, fontSize: 10.5, color: colors.textMid, textAlign: 'center' },
});
