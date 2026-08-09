import { create } from 'zustand';
import { subscribeToFriendsCatchEvents, type FriendCatchEvent } from '../services/friendsService';

const MAX_QUEUE = 5;

interface FriendActivityState {
  queue: FriendCatchEvent[];
  subscribe: (friendUids: string[]) => () => void;
  dismiss: (id: string) => void;
}

export const useFriendActivityStore = create<FriendActivityState>((set) => ({
  queue: [],
  subscribe: (friendUids: string[]) =>
    subscribeToFriendsCatchEvents(friendUids, (event) =>
      set((state) => ({ queue: [...state.queue, event].slice(-MAX_QUEUE) }))
    ),
  dismiss: (id: string) => set((state) => ({ queue: state.queue.filter((e) => e.id !== id) })),
}));
