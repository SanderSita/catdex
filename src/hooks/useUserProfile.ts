import { useEffect, useState } from 'react';
import { subscribeToUserProfile, type UserProfile } from '../services/userService';

export function useUserProfile(uid: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeToUserProfile(uid, setProfile);
  }, [uid]);

  return profile;
}
