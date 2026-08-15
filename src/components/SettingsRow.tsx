import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, fonts } from '../theme';

interface SettingsRowProps {
  title: string;
  detail?: string;
  chevron?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}

export function SettingsRow({ title, detail, chevron = true, isLast, onPress }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.row,
        isLast ? null : styles.divider,
        pressed ? styles.rowPressed : null,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        {chevron ? <ChevronRight size={18} color={colors.textLight} /> : null}
      </View>
    </Pressable>
  );
}

export function SettingsSection({ header, children }: { header: string; children: ReactNode }) {
  return (
    <View>
      <Text style={styles.header}>{header}</Text>
      <View style={styles.section}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.creamMuted2,
  },
  rowPressed: {
    backgroundColor: colors.creamMuted,
  },
  title: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textDark,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detail: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
});
