# CatDex

React Native (Expo) app for logging cat sightings on a map, building a personal
breed "dex," and tracking achievements. iOS + Android from one codebase.

## Stack

- Expo (React Native + TypeScript), React Navigation
- Firebase: Auth (anonymous), Firestore, Storage, Cloud Functions
- Maps: `react-native-maps` + clustering; geospatial radius search via
  client-computed geohashes (`src/services/geo.ts`) — Firestore has no native
  "within N km" query
- Breed classification: Cloud Function (`functions/src/classifyBreed.ts`)
  proxying to the Roboflow-hosted `cat-breeds-2n7zk/2` model — the API key
  never ships in the app

Cat re-identification (auto-detecting a repeat sighting of the same real-world
cat) is intentionally not implemented — see `src/screens/NewSightingScreen.tsx`,
which instead offers a manual "add to an existing cat" picker.

## First-time setup

1. **Firebase project**: create one at console.firebase.google.com, enable
   Anonymous Auth, Firestore, and Storage.
2. Copy `.env.example` to `.env` and fill in the Firebase web config values
   (Project settings > General > Your apps).
3. `firebase use --add` to point the CLI at your project, then:
   ```
   firebase deploy --only firestore:rules,storage
   ```
4. **Roboflow secret**: rotate/create an API key in your Roboflow account,
   then set it for deployed functions:
   ```
   firebase functions:secrets:set ROBOFLOW_API_KEY
   ```
   For local emulator testing, copy `functions/.secret.local.example` to
   `functions/.secret.local` instead.
5. Deploy functions: `cd functions && npm install && firebase deploy --only functions`
6. Reconcile `src/data/breeds.ts` — the `modelLabels` are a best guess at the
   Roboflow model's actual class names; check them against the model's
   Versions page before relying on classification results.

## Running the app

Needs a custom dev client (Firebase's native SDK isn't in Expo Go):

```
npx expo install
npx expo run:ios      # or: npx expo run:android
```

## Project layout

- `src/screens` — the 8 screens (Map, Camera, New Sighting, Breed Search, Cat
  Detail, Collection, Profile, Privacy)
- `src/services` — Firebase/Firestore/Storage access, geohashing, breed
  classification client
- `functions/src` — `classifyBreed` (Roboflow proxy) and `onSightingCreated`
  (denormalizes sighting counts, unlocks achievements)
- `firestore.rules` / `storage.rules` — owner-only access, scoped to
  `users/{uid}/...`
