import { create } from 'zustand';

interface BreedPickState {
  pickedBreedId: string | null;
  pick: (breedId: string) => void;
  consume: () => string | null;
}

export const useBreedPickStore = create<BreedPickState>((set, get) => ({
  pickedBreedId: null,
  pick: (breedId) => set({ pickedBreedId: breedId }),
  consume: () => {
    const value = get().pickedBreedId;
    set({ pickedBreedId: null });
    return value;
  },
}));
