# CatDex

React Native (Expo) app for logging cat sightings on a map, building a personal
breed "dex," and tracking achievements. iOS + Android from one codebase.

## Stack

- Expo (React Native + TypeScript), React Navigation
- Supabase: Auth (anonymous), Postgres, Storage, Edge Functions
- Maps: `react-native-maps` + clustering; geospatial radius search via
  client-computed geohashes (`src/services/geo.ts`) — no PostGIS, so we bound
  by geohash prefix range in Postgres and cut precisely client-side
- Breed classification: Edge Function (`supabase/functions/classify-breed`)
  proxying to the Roboflow-hosted `cat-breeds-2n7zk/2` model — the API key
  never ships in the app

Cat re-identification (auto-detecting a repeat sighting of the same real-world
cat) is intentionally not implemented — see `src/screens/NewSightingScreen.tsx`,
which instead offers a manual "add to an existing cat" picker.

## First-time setup

1. **Supabase project**: create one at supabase.com/dashboard, then in
   Authentication > Providers, enable "Allow anonymous sign-ins".
2. Copy `.env.example` to `.env` and fill in the project URL and anon key
   (Project Settings > API).
3. Link the CLI and apply the schema (tables, RLS policies, storage bucket,
   the sighting-denormalization/achievements trigger):
   ```
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
4. **Roboflow secret**: rotate/create an API key in your Roboflow account,
   then set it for the deployed function:
   ```
   npx supabase secrets set ROBOFLOW_API_KEY=<your-key>
   ```
5. Deploy the function: `npx supabase functions deploy classify-breed`
6. Reconcile `src/data/breeds.ts` — the `modelLabels` are a best guess at the
   Roboflow model's actual class names; check them against the model's
   Versions page before relying on classification results.

## Running the app

Needs a custom dev client (Supabase's realtime/storage SDKs aren't in Expo Go):

```
npx expo install
npx expo run:ios      # or: npx expo run:android
```

### Running on a physical Android device

1. On the device: Settings > About phone, tap "Build number" 7 times to
   unlock Developer options, then Settings > Developer options > enable
   "USB debugging".
2. Connect the device via USB and accept the "Allow USB debugging?" prompt
   that appears on screen.
3. Verify the computer sees it: `adb devices` should list it as `device`
   (not `unauthorized` — if so, re-check the on-device prompt).
4. From the project root: `npx expo run:android`. This builds the native
   app from the checked-in `android/` project, installs it on the connected
   device, and starts Metro — no emulator needed. If more than one device/
   emulator is attached, pass `--device` to pick which one.

Prefer wireless over USB? Android 11+ supports pairing over Wi-Fi: Settings >
Developer options > Wireless debugging > "Pair device with pairing code",
then `adb pair <ip>:<port>` and `adb connect <ip>:<port>` with the values
shown on screen before running `npx expo run:android`.

## Project layout

- `src/screens` — the 8 screens (Map, Camera, New Sighting, Breed Search, Cat
  Detail, Collection, Profile, Privacy)
- `src/services` — Supabase (Postgres/Storage/Auth) access, geohashing, breed
  classification client
- `supabase/migrations` — schema, RLS policies, storage bucket/policies, and
  the `handle_new_sighting` trigger (denormalizes sighting counts, recomputes
  stats, unlocks achievements — replaces a Firestore-trigger Cloud Function)
- `supabase/functions/classify-breed` — Roboflow proxy Edge Function
- RLS policies in `supabase/migrations/0001_init.sql` — owner-only access,
  scoped to `auth.uid()`
