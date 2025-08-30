'use server';

/**
 * @fileOverview Analyzes a job description to identify key skills, qualifications, and keywords.
 *
 * - analyzeJobDescription - A function that analyzes the job description.
 * - AnalyzeJobDescriptionInput - The input type for the analyzeJobDescription function.
 * - AnalyzeJobDescriptionOutput - The return type for the analyzeJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeJobDescriptionInputSchema = z.object({
  jobDescription: z.string().describe('The job description to analyze.'),
});
export type AnalyzeJobDescriptionInput = z.infer<typeof AnalyzeJobDescriptionInputSchema>;

const AnalyzeJobDescriptionOutputSchema = z.object({
  skills: z.array(z.string()).describe('Key skills identified in the job description.'),
  qualifications: z.array(z.string()).describe('Key qualifications listed in the job description.'),
  keywords: z.array(z.string()).describe('Important keywords from the job description.'),
});
export type AnalyzeJobDescriptionOutput = z.infer<typeof AnalyzeJobDescriptionOutputSchema>;

export async function analyzeJobDescription(input: AnalyzeJobDescriptionInput): Promise<AnalyzeJobDescriptionOutput> {
  return analyzeJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJobDescriptionPrompt',
  input: {schema: AnalyzeJobDescriptionInputSchema},
  output: {schema: AnalyzeJobDescriptionOutputSchema},
  prompt: `You are an expert recruiter. Please analyze the following job description and extract key skills, qualifications, and keywords.

Job Description:
{{{jobDescription}}}

Skills: (list the skills as a simple array of strings)
Qualifications: (list the qualifications as a simple array of strings)
Keywords: (list the keywords as a simple array of strings)

Make sure the output is parseable JSON.
`,
});

const analyzeJobDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeJobDescriptionFlow',
    inputSchema: AnalyzeJobDescriptionInputSchema,
    outputSchema: AnalyzeJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      prompt: prompt.prompt,
      model: 'googleai/gemini-2.0-flash',
      output: {
        schema: prompt.output.schema!,
      },
      input: input,
    });
    return output!;
  }
);
