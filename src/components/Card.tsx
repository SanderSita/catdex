import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  level?: 'level1' | 'level2' | 'level3' | 'floating';
  tint?: 'card' | 'cream' | 'teal' | 'coral';
  style?: StyleProp<ViewStyle>;
}

const tintColors = {
  card: colors.card,
  cream: colors.creamMuted,
  teal: colors.tealBgSoft,
  coral: colors.coralBgSoft,
} as const;

/** Generic elevated surface. Use for anything that should read as "raised" off the background. */
export function Card({ children, level = 'level1', tint = 'card', style }: CardProps) {
  return (
    <View style={[styles.base, { backgroundColor: tintColors[tint] }, shadows[level], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
  },
});
