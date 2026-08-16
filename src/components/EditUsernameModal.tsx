import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, shadows } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import type { UpdateUsernameResult } from '../services/userService';

interface Props {
  visible: boolean;
  currentName: string;
  onSave: (name: string) => Promise<UpdateUsernameResult>;
  onClose: () => void;
}

export function EditUsernameModal({ visible, currentName, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setValue(currentName);
      setError(null);
    }
  }, [visible, currentName]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await onSave(value);
      if (result === 'invalid') setError(t('editUsername.invalid'));
      else if (result === 'taken') setError(t('editUsername.taken'));
      else onClose();
    } catch {
      setError(t('editUsername.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('editUsername.title')}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={t('editUsername.placeholder')}
            placeholderTextColor={colors.textLight}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            editable={!saving}
            style={styles.input}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>{t('editUsername.cancel')}</Text>
            </Pressable>
            <PrimaryButton
              label={saving ? t('editUsername.saving') : t('editUsername.save')}
              onPress={handleSave}
              disabled={saving || !value.trim()}
              style={styles.saveButton}
            />
          </View>
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
    paddingVertical: 24,
    paddingHorizontal: 22,
    ...shadows.floating,
  },
  title: {
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    color: colors.textDark,
    textAlign: 'center',
  },
  input: {
    marginTop: 18,
    backgroundColor: colors.creamMuted,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.textDark,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
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
