import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { TabScreenProps } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = TabScreenProps<'Map'>;

// react-native-maps has no web target (its Fabric native components have no
// react-native-web codegen shim), so this platform-specific file replaces
// MapScreen.tsx on web builds instead of pulling that import in at all.
export function MapScreen({}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>{t('map.title')}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.message}>{t('map.webUnsupported')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.coral },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  message: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
});
