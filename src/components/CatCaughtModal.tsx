import { Modal, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CatThumb } from './CatThumb';
import { CelebrationBurst } from './CelebrationBurst';
import { PrimaryButton } from './PrimaryButton';
import { colors, fonts, shadows } from '../theme';

const THUMB_SIZE = 120;

interface Props {
  name: string;
  photoUrl: string;
  onDone: () => void;
}

/** Celebratory "you caught a new cat" moment, shown right after saving a brand-new sighting. */
export function CatCaughtModal({ name, photoUrl, onDone }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onDone}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{t('catCaught.title')}</Text>
          <View style={styles.thumbStack}>
            <CelebrationBurst color={colors.coral} size={THUMB_SIZE} replayKey={name}>
              <CatThumb uri={photoUrl} shape="circle" size={THUMB_SIZE} />
            </CelebrationBurst>
          </View>
          <Text style={styles.label}>{t('catCaught.subtitle', { name })}</Text>
          <PrimaryButton label={t('catCaught.nice')} onPress={onDone} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...shadows.floating,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.coral,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  thumbStack: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.headingSemi,
    fontSize: 20,
    color: colors.textDark,
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 22,
    width: '100%',
  },
});
