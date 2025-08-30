
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This is the primary Genkit configuration.
// It is used for development and for flows that do not require dynamic API keys.
// For production or user-specific keys, flows should dynamically configure genkit.
export const ai = genkit({
  plugins: [googleAI()],
});
