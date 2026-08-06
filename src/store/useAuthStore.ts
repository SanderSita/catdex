import { create } from 'zustand';
import { ensureSignedIn } from '../services/firebase';
import { ensureUserProfile } from '../services/userService';

interface AuthState {
  uid: string | null;
  ready: boolean;
  error: string | null;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  ready: false,
  error: null,
  init: async () => {
    try {
      const user = await ensureSignedIn();
      await ensureUserProfile(user.uid);
      set({ uid: user.uid, ready: true });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), ready: true });
    }
  },
}));
