'use server';

/**
 * @fileOverview Calculates an ATS score for a resume based on the job description and provides suggestions for improvement.
 *
 * - calculateAtsScore - A function that calculates the ATS score and provides suggestions.
 * - CalculateAtsScoreInput - The input type for the calculateAtsScore function.
 * - CalculateAtsScoreOutput - The return type for the calculateAtsScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateAtsScoreInputSchema = z.object({
  resume: z.string().describe('The resume content as a string.'),
  jobDescription: z.string().describe('The job description as a string.'),
});
export type CalculateAtsScoreInput = z.infer<typeof CalculateAtsScoreInputSchema>;

const CalculateAtsScoreOutputSchema = z.object({
  atsScore: z.number().describe('The ATS score, a value between 0 and 100.'),
  suggestions: z.array(z.string()).describe('Suggestions for improving the resume to better match the job description.'),
});
export type CalculateAtsScoreOutput = z.infer<typeof CalculateAtsScoreOutputSchema>;

export async function calculateAtsScore(input: CalculateAtsScoreInput): Promise<CalculateAtsScoreOutput> {
  return calculateAtsScoreFlow(input);
}

const calculateAtsScorePrompt = ai.definePrompt({
  name: 'calculateAtsScorePrompt',
  input: {schema: CalculateAtsScoreInputSchema},
  output: {schema: CalculateAtsScoreOutputSchema},
  prompt: `You are an expert resume optimizer specializing in Applicant Tracking Systems (ATS). Given a resume and a job description, calculate an ATS score (0-100) and provide specific, actionable suggestions to improve the resume's ATS compatibility.

Resume:
{{{resume}}}

Job Description:
{{{jobDescription}}}

Consider factors such as keyword matching, formatting, section headings, and overall relevance to the job description. Explain why the ATS score was assigned and focus on improvements related to getting past the ATS. Focus on providing suggestions that improve the keyword matching in particular, such as re-wording the resume to use the same keywords.

Respond with the ATS score and suggestions in the following JSON format:
{
  "atsScore": number,
  "suggestions": string[]
}`,
});

const calculateAtsScoreFlow = ai.defineFlow(
  {
    name: 'calculateAtsScoreFlow',
    inputSchema: CalculateAtsScoreInputSchema,
    outputSchema: CalculateAtsScoreOutputSchema,
  },
  async input => {
    const {output} = await calculateAtsScorePrompt(input);
    return output!;
  }
);
