import i18next, { type TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { resources, type SupportedLanguage } from './resources';

/**
 * Translate a key built at runtime (e.g. `breeds.${id}`), which can't be checked against
 * the static literal-key union `t()` normally requires. Use only for genuinely dynamic keys.
 */
export function tKey(t: TFunction, key: string, options?: Record<string, unknown>): string {
  return t(key as never, options as never) as unknown as string;
}

export function detectLanguage(): SupportedLanguage {
  return Localization.getLocales()[0]?.languageCode === 'nl' ? 'nl' : 'en';
}

i18next.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18next;
