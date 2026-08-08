import type { TFunction } from 'i18next';
import { tKey } from '../i18n';
import type { Breed } from '../types/models';

// modelLabels map to the Roboflow "cat-breeds-2n7zk/2" class list, which is:
// Abyssinian, Bengal, Birman, Bombay, British_Shorthair, Egyptian_Mau,
// Maine_Coon, Persian, Ragdoll, Russian_Blue, Siamese, Sphynx.
export const BREEDS: Breed[] = [
  { id: 'abyssinian', modelLabels: ['Abyssinian'] },
  { id: 'bengal', modelLabels: ['Bengal'] },
  { id: 'birman', modelLabels: ['Birman'] },
  { id: 'bombay', modelLabels: ['Bombay'] },
  { id: 'british-shorthair', modelLabels: ['British Shorthair', 'British_Shorthair'] },
  { id: 'egyptian-mau', modelLabels: ['Egyptian Mau', 'Egyptian_Mau'] },
  { id: 'maine-coon', modelLabels: ['Maine Coon', 'Maine_Coon'] },
  { id: 'persian', modelLabels: ['Persian'] },
  { id: 'ragdoll', modelLabels: ['Ragdoll'] },
  { id: 'russian-blue', modelLabels: ['Russian Blue', 'Russian_Blue'] },
  { id: 'siamese', modelLabels: ['Siamese'] },
  { id: 'sphynx', modelLabels: ['Sphynx'] },
];

export function breedIdFromModelLabel(label: string): string | null {
  const found = BREEDS.find((b) =>
    b.modelLabels.some((l) => l.toLowerCase() === label.toLowerCase())
  );
  return found ? found.id : null;
}

/** Translated display name for a breed id. Pass `t` from `useTranslation()` (or the raw `i18n.t`). */
export function breedNameById(id: string | null, t: TFunction): string {
  if (!id || !BREEDS.some((b) => b.id === id)) return t('common.unknown');
  return tKey(t, `breeds.${id}`);
}
