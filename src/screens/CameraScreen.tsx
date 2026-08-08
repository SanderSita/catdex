import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from 'expo-camera';
import { X, Zap, ZapOff, SwitchCamera } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useLocation } from '../hooks/useLocation';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export function CameraScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const { coords } = useLocation();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionWrap]}>
        <Text style={styles.permissionText}>CatDex needs camera access to photograph cats.</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonLabel}>Grant access</Text>
        </Pressable>
      </View>
    );
  }

  const capture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (!photo || !coords) return;
    navigation.replace('NewSighting', { photoUri: photo.uri, lat: coords.lat, lng: coords.lng });
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} flash={flash} />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.roundButton} onPress={() => navigation.goBack()}>
          <X size={18} color={colors.white} />
        </Pressable>
        <Pressable
          style={styles.roundButton}
          onPress={() => setFlash((f) => (f === 'off' ? 'on' : 'off'))}
        >
          {flash === 'off' ? (
            <ZapOff size={18} color={colors.white} />
          ) : (
            <Zap size={18} color={colors.white} />
          )}
        </Pressable>
      </View>

      <View style={styles.viewfinderFrame} pointerEvents="none">
        <View style={styles.hintPill}>
          <Text style={styles.hintText}>Frame the cat</Text>
        </View>
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 22 }]}>
        <View style={styles.smallThumbPlaceholder} />
        <Pressable style={styles.shutterOuter} onPress={capture}>
          <View style={styles.shutterInner} />
        </Pressable>
        <Pressable
          style={styles.roundButtonSmall}
          onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
        >
          <SwitchCamera size={20} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cameraBg },
  permissionWrap: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  permissionText: { fontFamily: fonts.body, color: colors.white, textAlign: 'center', fontSize: 15 },
  permissionButton: { backgroundColor: colors.coral, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999 },
  permissionButtonLabel: { fontFamily: fonts.bodyBold, color: colors.white },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderFrame: {
    position: 'absolute',
    top: 130,
    left: 24,
    right: 24,
    bottom: 180,
    borderRadius: 24,
    overflow: 'hidden',
  },
  hintPill: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: colors.overlayDark,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  hintText: { color: colors.white, fontFamily: fonts.bodySemi, fontSize: 13 },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: colors.white, borderWidth: 3 },
  cornerTL: { top: 18, left: 18, borderRightWidth: 0, borderBottomWidth: 0, borderRadius: 6 },
  cornerTR: { top: 18, right: 18, borderLeftWidth: 0, borderBottomWidth: 0, borderRadius: 6 },
  cornerBL: { bottom: 18, left: 18, borderRightWidth: 0, borderTopWidth: 0, borderRadius: 6 },
  cornerBR: { bottom: 18, right: 18, borderLeftWidth: 0, borderTopWidth: 0, borderRadius: 6 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallThumbPlaceholder: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.overlayLight },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.coral },
});
