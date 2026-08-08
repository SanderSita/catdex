import { useEffect } from 'react';
import { AppState } from 'react-native';
import i18n, { detectLanguage } from '../i18n';

/** Android allows changing the system language without restarting the app; re-sync on foreground. */
export function useAppLocaleSync() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const next = detectLanguage();
      if (next !== i18n.language) i18n.changeLanguage(next);
    });
    return () => subscription.remove();
  }, []);
}
