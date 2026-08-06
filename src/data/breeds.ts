import type { Breed } from '../types/models';

// modelLabels are best-guess mappings to the Roboflow "cat-breeds-2n7zk/2"
// class names — verify against the model's actual class list (Roboflow
// project page > Versions > 2 > Classes) and adjust before shipping.
export const BREEDS: Breed[] = [
  { id: 'tabby', name: 'Tabby', modelLabels: ['Tabby', 'tabby'] },
  { id: 'siamese', name: 'Siamese', modelLabels: ['Siamese', 'siamese'] },
  { id: 'calico', name: 'Calico', modelLabels: ['Calico', 'calico'] },
  { id: 'tuxedo', name: 'Tuxedo', modelLabels: ['Tuxedo', 'tuxedo'] },
  { id: 'maine-coon', name: 'Maine Coon', modelLabels: ['Maine Coon', 'Maine_Coon'] },
  { id: 'persian', name: 'Persian', modelLabels: ['Persian', 'persian'] },
  { id: 'british-shorthair', name: 'Brit. Shorthair', modelLabels: ['British Shorthair'] },
  { id: 'ragdoll', name: 'Ragdoll', modelLabels: ['Ragdoll', 'ragdoll'] },
  { id: 'sphynx', name: 'Sphynx', modelLabels: ['Sphynx', 'sphynx'] },
  { id: 'bengal', name: 'Bengal', modelLabels: ['Bengal', 'bengal'] },
  { id: 'russian-blue', name: 'Russian Blue', modelLabels: ['Russian Blue'] },
  { id: 'scottish-fold', name: 'Scottish Fold', modelLabels: ['Scottish Fold'] },
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
