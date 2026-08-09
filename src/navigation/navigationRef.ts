import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** Used for deep-link and push-notification-tap navigation, from outside a screen's own props. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
