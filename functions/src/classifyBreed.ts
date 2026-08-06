import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import axios from 'axios';

const ROBOFLOW_API_KEY = defineSecret('ROBOFLOW_API_KEY');
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

function parseTopPrediction(data: RoboflowResponse): { label: string; confidence: number } {
  if (typeof data.top === 'string' && typeof data.confidence === 'number') {
    return { label: data.top, confidence: data.confidence };
  }
  if (Array.isArray(data.predictions) && data.predictions.length > 0) {
    const best = [...data.predictions].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];
    const label = best.class ?? best.class_name ?? best.label;
    if (label && typeof best.confidence === 'number') {
      return { label, confidence: best.confidence };
    }
  }
  throw new HttpsError('internal', 'Unrecognized response from breed classifier.');
}

export const classifyBreed = onCall(
  { secrets: [ROBOFLOW_API_KEY], region: 'us-central1', timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign-in required.');
    }
    const photoUrl = request.data?.photoUrl;
    if (typeof photoUrl !== 'string' || !photoUrl) {
      throw new HttpsError('invalid-argument', 'photoUrl is required.');
    }

    const imageResponse = await axios.get<ArrayBuffer>(photoUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(imageResponse.data).toString('base64');

    const inference = await axios.post<RoboflowResponse>(MODEL_ENDPOINT, base64Image, {
      params: { api_key: ROBOFLOW_API_KEY.value() },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return parseTopPrediction(inference.data);
  }
);
