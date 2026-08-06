import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export function StatTile({ value, label, dark }: { value: string | number; label: string; dark?: boolean }) {
  return (
    <View style={[styles.tile, dark ? styles.tileDark : null]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.creamMuted,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tileDark: {
    backgroundColor: colors.card,
  },
  value: {
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    color: colors.textDark,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
