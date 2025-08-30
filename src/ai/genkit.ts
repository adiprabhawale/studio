
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This is the primary Genkit configuration.
// It uses the googleAI plugin, which will automatically use the
// `GEMINI_API_KEY` environment variable for authentication.
// There is no need for dynamic configuration or passing keys from the client.
export const ai = genkit({
  plugins: [googleAI()],
});
