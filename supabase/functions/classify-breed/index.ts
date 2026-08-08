// Deno Edge Function. Port of the former functions/src/classifyBreed.ts
// Cloud Function: proxies to the Roboflow "cat-breeds-2n7zk/2" hosted model
// server-side (keeps the API key out of the client). photoUrl must already
// be a reachable Storage download URL. JWT verification (sign-in required)
// is enforced by the platform before this handler runs.

const ROBOFLOW_API_KEY = Deno.env.get('ROBOFLOW_API_KEY') ?? '';
const MODEL_ENDPOINT = 'https://serverless.roboflow.com/cat-breeds-2n7zk/2';

interface RoboflowPrediction {
  class?: string;
  class_name?: string;
  label?: string;
  confidence?: number;
}

interface RoboflowResponse {
  top?: string;
  confidence?: number;
  predictions?: RoboflowPrediction[];
}

function parseTopPrediction(data: RoboflowResponse): { label: string | null; confidence: number } {
  if (typeof data.top === 'string' && typeof data.confidence === 'number') {
    return { label: data.top, confidence: data.confidence };
  }
  if (Array.isArray(data.predictions)) {
    if (data.predictions.length === 0) {
      return { label: null, confidence: 0 };
    }
    const best = [...data.predictions].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];
    const label = best.class ?? best.class_name ?? best.label;
    if (label && typeof best.confidence === 'number') {
      return { label, confidence: best.confidence };
    }
  }
  throw new Error('Unrecognized response from breed classifier.');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  let photoUrl: unknown;
  try {
    ({ photoUrl } = await req.json());
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }
  if (typeof photoUrl !== 'string' || !photoUrl) {
    return json({ error: 'photoUrl is required.' }, 400);
  }

  try {
    const imageResponse = await fetch(photoUrl);
    if (!imageResponse.ok) {
      console.error('[classify-breed] failed to fetch photoUrl:', imageResponse.status, imageResponse.statusText);
      return json({ error: `Could not fetch photoUrl (${imageResponse.status}).` }, 400);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = arrayBufferToBase64(imageBuffer);

    const inferenceUrl = new URL(MODEL_ENDPOINT);
    inferenceUrl.searchParams.set('api_key', ROBOFLOW_API_KEY);

    const inferenceResponse = await fetch(inferenceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: base64Image,
    });
    if (!inferenceResponse.ok) {
      const bodyText = await inferenceResponse.text();
      console.error('[classify-breed] Roboflow request failed:', inferenceResponse.status, bodyText);
      return json({ error: `Classifier request failed (${inferenceResponse.status}).` }, 502);
    }

    const inference = (await inferenceResponse.json()) as RoboflowResponse;
    return json(parseTopPrediction(inference));
  } catch (err) {
    console.error('[classify-breed] classification error:', err);
    return json({ error: err instanceof Error ? err.message : 'Classification failed.' }, 500);
  }
});
