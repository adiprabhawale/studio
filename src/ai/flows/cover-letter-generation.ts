
'use server';
import { config } from 'dotenv';
config();

/**
 * @fileOverview Cover letter generation flow.
 *
 * - generateCoverLetter - A function that generates a cover letter tailored to the job description.
 * - CoverLetterInput - The input type for the generateCoverLetter function.
 * - CoverLetterOutput - The return type for the generateCoverLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const CoverLetterInputSchema = z.object({
  jobDescription: z.string().describe('The job description to tailor the cover letter to.'),
  userInformation: z.string().describe('The user information to include in the cover letter.'),
});
export type CoverLetterInput = z.infer<typeof CoverLetterInputSchema>;

const CoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter.'),
});
export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;

export async function generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterOutput> {
  return coverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coverLetterPrompt',
  model: googleAI.model('gemini-2.0-flash'),
  input: {schema: CoverLetterInputSchema},
  output: {schema: CoverLetterOutputSchema},
  prompt: `You are an expert career advisor. Your goal is to generate a cover letter based on the user information provided and tailored to the job description provided.

Job Description: {{{jobDescription}}}

User Information: {{{userInformation}}}

Generate a professional, well-formatted cover letter.
`,
});

const coverLetterFlow = ai.defineFlow(
  {
    name: 'coverLetterFlow',
    inputSchema: CoverLetterInputSchema,
    outputSchema: CoverLetterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
