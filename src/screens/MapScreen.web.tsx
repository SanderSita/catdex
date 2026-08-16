import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { TabScreenProps } from '../navigation/types';
import { useLocation } from '../hooks/useLocation';
import { colors, fonts } from '../theme';

type Props = TabScreenProps<'Map'>;

// react-native-maps has no web target (its Fabric native components have no
// react-native-web codegen shim), so this platform-specific file replaces
// MapScreen.tsx on web builds instead of pulling that import in at all. The
// "new sighting" flow doesn't depend on react-native-maps though, so it's
// kept working here — which also gives the browser a reason to prompt for
// location access the way the native map does.
export function MapScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  useLocation();

  const openCamera = useCallback(() => navigation.navigate('Camera'), [navigation]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>{t('map.title')}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.message}>{t('map.webUnsupported')}</Text>
      </View>
      <Pressable style={styles.fab} onPress={openCamera}>
        <Camera size={20} color={colors.white} strokeWidth={2.5} />
        <Text style={styles.fabLabel}>{t('map.newSighting')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.coral },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  message: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 26,
    backgroundColor: colors.coral,
    shadowColor: colors.coral,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  fabLabel: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.white },
});
