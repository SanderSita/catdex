import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TabParamList = {
  Map: undefined;
  Collection: undefined;
  Friends: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Camera: undefined;
  NewSighting: { photoUri: string; lat: number; lng: number };
  BreedSearch: undefined;
  CatDetail: { catId: string };
  Privacy: undefined;
  AddFriend: { prefillCode?: string } | undefined;
  FriendDetail: { friendUid: string; friendName?: string };
};

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
