import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors, fonts, shadows } from '../theme';
import { usePressScale } from '../hooks/usePressScale';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({ label, onPress, disabled, style }: PrimaryButtonProps) {
  const { onPressIn, onPressOut, animatedStyle } = usePressScale();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      disabled={disabled}
      style={[styles.button, disabled ? styles.disabled : null, animatedStyle, style]}
    >
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.coral,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadows.level2,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.white,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
});
