import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, ChevronDown, Users } from 'lucide-react-native';
import { Circle, Marker } from 'react-native-maps';
import MapView from 'react-native-map-clustering';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import type { TabScreenProps } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { useFriendsStore } from '../store/useFriendsStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLocation } from '../hooks/useLocation';
import { useNearbyCats } from '../hooks/useNearbyCats';
import { useFriendsNearbyCats } from '../hooks/useFriendsNearbyCats';
import { otherUid } from '../services/friendsService';
import { CatThumb } from '../components/CatThumb';
import { colors, fonts } from '../theme';

const RADIUS_OPTIONS = [1, 3, 5, 10];

type Props = TabScreenProps<'Map'>;

export function MapScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const uid = useAuthStore((s) => s.uid);
  const profile = useUserProfile(uid);
  const { coords } = useLocation();
  const [radiusKm, setRadiusKm] = useState(3);
  const [radiusInitialized, setRadiusInitialized] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const { nearby } = useNearbyCats(uid, coords, radiusKm);

  const friendships = useFriendsStore((s) => s.friendships);
  const acceptedFriendUids = useMemo(
    () => (uid ? friendships.filter((f) => f.status === 'accepted').map((f) => otherUid(f, uid)) : []),
    [friendships, uid]
  );
  const { nearby: friendsNearby } = useFriendsNearbyCats(showFriends ? acceptedFriendUids : [], coords, radiusKm);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [140, 320], []);

  useEffect(() => {
    if (!radiusInitialized && profile) {
      setRadiusKm(profile.defaultRadiusKm);
      setRadiusInitialized(true);
    }
  }, [profile, radiusInitialized]);

  const openCamera = useCallback(() => navigation.navigate('Camera'), [navigation]);
  const openCat = useCallback((catId: string) => navigation.navigate('CatDetail', { catId }), [navigation]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>{t('map.title')}</Text>
        <View style={styles.headerChips}>
          <Pressable
            style={[styles.friendsChip, showFriends ? styles.friendsChipActive : null]}
            onPress={() => setShowFriends((v) => !v)}
          >
            <Users size={14} color={showFriends ? colors.white : colors.tealTextSoft} />
            <Text style={[styles.radiusText, showFriends ? styles.friendsChipTextActive : null]}>
              {t('map.friendsToggle')}
            </Text>
          </Pressable>
          <Pressable style={styles.radiusChip} onPress={() => setPickerOpen(true)}>
            <Text style={styles.radiusText}>{t('map.radiusLabel', { km: radiusKm })}</Text>
            <ChevronDown size={14} color={colors.tealTextSoft} />
          </Pressable>
        </View>
      </View>

      <View style={styles.mapWrap}>
        {coords ? (
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: coords.lat,
              longitude: coords.lng,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation
            clusterColor={colors.coral}
            clusterTextColor={colors.white}
          >
            <Circle
              center={{ latitude: coords.lat, longitude: coords.lng }}
              radius={radiusKm * 1000}
              strokeColor={colors.teal}
              fillColor="rgba(78,147,168,0.12)"
            />
            {nearby.map((cat) => (
              <Marker
                key={cat.id}
                coordinate={{ latitude: cat.lat, longitude: cat.lng }}
                onPress={() => openCat(cat.id)}
              >
                <View style={styles.pin}>
                  <CatThumb uri={cat.primaryPhotoUrl} shape="circle" />
                </View>
              </Marker>
            ))}
            {showFriends &&
              friendsNearby.map((cat) => (
                <Marker
                  key={cat.id}
                  coordinate={{ latitude: cat.lat, longitude: cat.lng }}
                  onPress={() => openCat(cat.id)}
                >
                  <View style={[styles.pin, styles.pinFriend]}>
                    <CatThumb uri={cat.primaryPhotoUrl} shape="circle" />
                  </View>
                </Marker>
              ))}
          </MapView>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.mapLoading]}>
            <Text style={styles.loadingText}>{t('map.locating')}</Text>
          </View>
        )}
      </View>

      <Pressable style={styles.fab} onPress={openCamera}>
        <Camera size={20} color={colors.white} strokeWidth={2.5} />
        <Text style={styles.fabLabel}>{t('map.newSighting')}</Text>
      </Pressable>

      <BottomSheet ref={sheetRef} snapPoints={snapPoints} index={0} backgroundStyle={styles.sheetBg}>
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>{t('map.catsNearby', { count: nearby.length })}</Text>
          <FlatList
            horizontal
            data={nearby.slice(0, 3)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
            ListFooterComponent={
              nearby.length > 3 ? (
                <View style={styles.overflowTile}>
                  <Text style={styles.overflowText}>+{nearby.length - 3}</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => openCat(item.id)} style={styles.previewTile}>
                <CatThumb uri={item.primaryPhotoUrl} shape="rect" />
              </Pressable>
            )}
          />
        </BottomSheetView>
      </BottomSheet>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <View style={styles.pickerSheet}>
            {RADIUS_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={styles.pickerRow}
                onPress={() => {
                  setRadiusKm(option);
                  setPickerOpen(false);
                }}
              >
                <Text style={styles.pickerLabel}>{t('map.radiusOption', { km: option })}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.coral },
  headerChips: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radiusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.tealBgSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  radiusText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.tealTextSoft },
  friendsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.tealBgSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  friendsChipActive: { backgroundColor: colors.teal },
  friendsChipTextActive: { color: colors.white },
  mapWrap: { flex: 1, backgroundColor: colors.mapBg },
  mapLoading: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: fonts.body, color: colors.textMuted },
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    padding: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  pinFriend: {
    borderWidth: 2.5,
    borderColor: colors.teal,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 160,
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
  sheetBg: { backgroundColor: colors.card, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  sheetContent: { paddingHorizontal: 20, paddingTop: 4 },
  sheetTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.textDark, marginBottom: 12 },
  previewTile: { width: 56, height: 56, borderRadius: 16, overflow: 'hidden' },
  overflowTile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.tealBgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.tealTextMuted },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 8 },
  pickerRow: { paddingVertical: 16, paddingHorizontal: 24 },
  pickerLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.textDark, textAlign: 'center' },
});
