import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ACHIEVEMENTS } from './achievements';

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Longest run of consecutive days (including today) with at least one sighting. */
function computeDayStreak(sightingDatesMs: number[]): number {
  const days = new Set(sightingDatesMs.map(dayKey));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/**
 * Fires on every new sighting: keeps the parent cat's sightingCount /
 * lastSeenAt authoritative (client writes are optimistic at best), then
 * recomputes user stats and unlocks any newly-earned achievements.
 */
export const onSightingCreated = onDocumentCreated(
  'users/{uid}/cats/{catId}/sightings/{sightingId}',
  async (event) => {
    const { uid, catId } = event.params as { uid: string; catId: string };
    const sighting = event.data?.data();
    if (!sighting) return;

    const db = getFirestore();
    const catRef = db.doc(`users/${uid}/cats/${catId}`);
    const sightingsSnap = await db.collection(`users/${uid}/cats/${catId}/sightings`).get();
    const capturedAtValues = sightingsSnap.docs.map((d) => {
      const v = d.data().capturedAt as Timestamp | undefined;
      return v?.toMillis() ?? Date.now();
    });

    await catRef.update({
      sightingCount: sightingsSnap.size,
      lastSeenAt: FieldValue.serverTimestamp(),
    });

    const catsSnap = await db.collection(`users/${uid}/cats`).get();
    const catsFound = catsSnap.size;
    const breedsUnlocked = new Set(
      catsSnap.docs.map((d) => d.data().breedId).filter((id): id is string => Boolean(id))
    ).size;

    const allSightingDates: number[] = [];
    for (const catDoc of catsSnap.docs) {
      const snap = await db.collection(`users/${uid}/cats/${catDoc.id}/sightings`).get();
      snap.docs.forEach((d) => {
        const v = d.data().capturedAt as Timestamp | undefined;
        if (v) allSightingDates.push(v.toMillis());
      });
    }
    const dayStreak = computeDayStreak(allSightingDates.length ? allSightingDates : capturedAtValues);

    const stats = { catsFound, breedsUnlocked, dayStreak };
    await db.doc(`users/${uid}`).set({ stats }, { merge: true });

    const unlockedRef = db.collection(`users/${uid}/unlockedAchievements`);
    for (const achievement of ACHIEVEMENTS) {
      if (!achievement.check(stats)) continue;
      const achRef = unlockedRef.doc(achievement.id);
      const achSnap = await achRef.get();
      if (!achSnap.exists) {
        await achRef.set({ unlockedAt: FieldValue.serverTimestamp() });
      }
    }
  }
);
