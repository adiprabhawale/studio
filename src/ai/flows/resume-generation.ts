
'use server';

/**
 * @fileOverview Dynamically generates a professional resume based on user information and job description.
 *
 * - generateResume - A function that handles the resume generation process.
 * - GenerateResumeInput - The input type for the generateResume function.
 * - GenerateResumeOutput - The return type for the generateResume function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const GenerateResumeInputSchema = z.object({
  userDetails: z.string().describe('A comprehensive string of the user details, including name, contact info, work experience, education, skills, projects, and certifications.'),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
  apiKey: z.string().optional().describe("The user's Gemini API key."),
});
export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

const GenerateResumeOutputSchema = z.object({
  resume: z.string().describe('The generated resume in a readable format, tailored to the job description.'),
});
export type GenerateResumeOutput = z.infer<typeof GenerateResumeOutputSchema>;

export async function generateResume(input: GenerateResumeInput): Promise<GenerateResumeOutput> {
  const ai = genkit({
    plugins: [googleAI({ apiKey: input.apiKey || process.env.GEMINI_API_KEY })],
  });

  const resumePrompt = ai.definePrompt({
    name: 'resumePrompt',
    model: googleAI.model('gemini-1.5-flash'),
    input: { schema: GenerateResumeInputSchema },
    output: { schema: GenerateResumeOutputSchema },
    prompt: `You are a professional resume writer. Generate a resume based on the user's details and tailored to the job description provided.

User Details: {{{userDetails}}}

Job Description: {{{jobDescription}}}

Consider the job description to highlight relevant skills and experiences.
Ensure the resume is visually appealing and easy to read. Include all relevant sections such as work experience, education, skills, projects, and certifications.
The skills section should be a comma-separated list.
Do not use markdown formatting. The output should be plain text.
`,
  });

  const { output } = await resumePrompt(input);
  return output!;
}
