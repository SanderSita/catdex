import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

export function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Privacy</Text>
      <Text style={styles.body}>
        Your sightings and photos are private to your account. Location data is only used to place your
        cats on your own map and is never shared with other users.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card, paddingHorizontal: 20 },
  title: { fontFamily: fonts.headingSemi, fontSize: 22, color: colors.textDark, marginBottom: 12 },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.textMid, lineHeight: 20 },
});
