import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserCats } from '../hooks/useUserCats';
import { AvatarThumb } from '../components/AvatarThumb';
import { StatTile } from '../components/StatTile';
import { CatsGrid } from '../components/CatsGrid';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendDetail'>;

export function FriendDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { friendUid, friendName } = route.params;
  const insets = useSafeAreaInsets();
  const profile = useUserProfile(friendUid);
  const cats = useUserCats(friendUid);

  const displayName = profile?.displayName ?? friendName ?? '…';

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
      ListHeaderComponent={
        <View>
          <View style={styles.topBar}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <ChevronLeft size={20} color={colors.textDark} />
            </Pressable>
          </View>

          <View style={styles.avatarSection}>
            <AvatarThumb icon={profile?.avatarIcon} color={profile?.avatarColor} size={88} />
            <Text style={styles.username}>{displayName}</Text>
          </View>

          {profile ? (
            <View style={styles.statsRow}>
              <StatTile value={profile.stats.catsFound} label={t('profile.catsFound')} dark />
              <StatTile value={profile.stats.breedsUnlocked} label={t('profile.breeds')} dark />
              <StatTile value={profile.stats.dayStreak} label={t('profile.dayStreak')} dark />
            </View>
          ) : null}
        </View>
      }
      data={[{ key: 'grid' }]}
      keyExtractor={(item) => item.key}
      renderItem={() => (
        <CatsGrid
          cats={cats}
          onPressCat={(catId) => navigation.navigate('CatDetail', { catId })}
          emptyLabel={t('friendDetail.empty')}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { paddingHorizontal: 20 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.creamMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: { alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12 },
  username: { fontFamily: fonts.headingSemi, fontSize: 18, color: colors.textDark },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 18 },
});
