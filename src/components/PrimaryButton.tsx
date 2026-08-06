import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({ label, onPress, disabled, style }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.coral,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: colors.coralDark,
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
