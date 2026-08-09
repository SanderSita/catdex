import { create } from 'zustand';
import { subscribeToFriendships, type Friendship } from '../services/friendsService';

interface FriendsState {
  friendships: Friendship[];
  subscribe: (uid: string) => () => void;
}

export const useFriendsStore = create<FriendsState>((set) => ({
  friendships: [],
  subscribe: (uid: string) => subscribeToFriendships(uid, (friendships) => set({ friendships })),
}));
