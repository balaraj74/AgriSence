import { config } from 'dotenv';
config();

import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: process.env.GCLOUD_PROJECT || 'agrisence-1dc30',
      location: process.env.GCLOUD_LOCATION || 'us-central1',
    }),
  ],
});
