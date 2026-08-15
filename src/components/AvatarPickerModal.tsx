import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import { CatFaceIcon } from './avatar/CatFaceIcon';
import { AVATAR_COLORS, CAT_ICON_IDS, type CatIconId } from '../data/avatars';

interface Props {
  visible: boolean;
  currentIcon: CatIconId;
  currentColor: string;
  onSave: (icon: CatIconId, color: string) => Promise<void>;
  onClose: () => void;
}

export function AvatarPickerModal({ visible, currentIcon, currentColor, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const [icon, setIcon] = useState(currentIcon);
  const [color, setColor] = useState(currentColor);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setIcon(currentIcon);
      setColor(currentColor);
    }
  }, [visible, currentIcon, currentColor]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(icon, color);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('avatarPicker.title')}</Text>

          <View style={styles.preview}>
            <CatFaceIcon expression={icon} color={color} size={72} />
          </View>

          <View style={styles.grid}>
            {CAT_ICON_IDS.map((id) => (
              <Pressable key={id} onPress={() => setIcon(id)} hitSlop={4}>
                <View style={[styles.iconCell, id === icon && styles.iconCellSelected]}>
                  <CatFaceIcon expression={id} color={colors.creamMuted3} faceColor={colors.textDark} size={44} />
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.swatchRow}>
            {AVATAR_COLORS.map((c) => (
              <Pressable key={c} onPress={() => setColor(c)} hitSlop={4}>
                <View style={[styles.swatch, { backgroundColor: c }, c === color && styles.swatchSelected]} />
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>{t('avatarPicker.cancel')}</Text>
            </Pressable>
            <PrimaryButton
              label={saving ? t('avatarPicker.saving') : t('avatarPicker.save')}
              onPress={handleSave}
              disabled={saving}
              style={styles.saveButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const SWATCH_SIZE = 32;

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
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 22,
  },
  title: {
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    color: colors.textDark,
    textAlign: 'center',
  },
  preview: { alignItems: 'center', marginTop: 18 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 20,
  },
  iconCell: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconCellSelected: {
    borderColor: colors.coral,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 18,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.textDark,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.creamMuted,
  },
  cancelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.textMid,
  },
  saveButton: {
    flex: 1,
  },
});
