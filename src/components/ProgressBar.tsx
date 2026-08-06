import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, percent))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.creamMuted2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.coral,
  },
});
