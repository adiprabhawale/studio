import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This is the default Genkit initialization, used for development.
// In production, the API key will be passed from the client and configured in `actions.ts`.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
