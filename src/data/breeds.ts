import type { Breed } from '../types/models';

// modelLabels map to the Roboflow "cat-breeds-2n7zk/2" class list, which is:
// Abyssinian, Bengal, Birman, Bombay, British_Shorthair, Egyptian_Mau,
// Maine_Coon, Persian, Ragdoll, Russian_Blue, Siamese, Sphynx.
export const BREEDS: Breed[] = [
  { id: 'abyssinian', name: 'Abyssinian', modelLabels: ['Abyssinian'] },
  { id: 'bengal', name: 'Bengal', modelLabels: ['Bengal'] },
  { id: 'birman', name: 'Birman', modelLabels: ['Birman'] },
  { id: 'bombay', name: 'Bombay', modelLabels: ['Bombay'] },
  { id: 'british-shorthair', name: 'Brit. Shorthair', modelLabels: ['British Shorthair', 'British_Shorthair'] },
  { id: 'egyptian-mau', name: 'Egyptian Mau', modelLabels: ['Egyptian Mau', 'Egyptian_Mau'] },
  { id: 'maine-coon', name: 'Maine Coon', modelLabels: ['Maine Coon', 'Maine_Coon'] },
  { id: 'persian', name: 'Persian', modelLabels: ['Persian'] },
  { id: 'ragdoll', name: 'Ragdoll', modelLabels: ['Ragdoll'] },
  { id: 'russian-blue', name: 'Russian Blue', modelLabels: ['Russian Blue', 'Russian_Blue'] },
  { id: 'siamese', name: 'Siamese', modelLabels: ['Siamese'] },
  { id: 'sphynx', name: 'Sphynx', modelLabels: ['Sphynx'] },
];

export function breedIdFromModelLabel(label: string): string | null {
  const found = BREEDS.find((b) =>
    b.modelLabels.some((l) => l.toLowerCase() === label.toLowerCase())
  );
  return found ? found.id : null;
}

export function breedNameById(id: string | null): string {
  if (!id) return 'Unknown';
  return BREEDS.find((b) => b.id === id)?.name ?? 'Unknown';
}
