import en from './locales/en.json';
import nl from './locales/nl.json';

export const resources = {
  en: { translation: en },
  nl: { translation: nl },
} as const;

export type SupportedLanguage = keyof typeof resources;
