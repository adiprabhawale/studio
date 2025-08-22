'use server';

/**
 * @fileOverview Dynamically generates a professional resume based on user information and job description.
 *
 * - generateResume - A function that handles the resume generation process.
 * - GenerateResumeInput - The input type for the generateResume function.
 * - GenerateResumeOutput - The return type for the generateResume function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateResumeInputSchema = z.object({
  userDetails: z.string().describe('A comprehensive string of the user details, including name, contact info, work experience, education, skills, projects, and certifications.'),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
  apiKey: z.string().optional().describe('The Gemini API key.'),
});
export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

const GenerateResumeOutputSchema = z.object({
  resume: z.string().describe('The generated resume in a readable format, tailored to the job description.'),
  atsScore: z.number().describe('The ATS score of the generated resume, reflecting its match to the job description.'),
  improvementSuggestions: z.string().describe('Suggestions for improving the resume to better match the job description and ATS requirements.'),
});
export type GenerateResumeOutput = z.infer<typeof GenerateResumeOutputSchema>;

export async function generateResume(input: GenerateResumeInput): Promise<GenerateResumeOutput> {
  return generateResumeFlow(input);
}

const resumePrompt = ai.definePrompt({
  name: 'resumePrompt',
  input: {schema: GenerateResumeInputSchema},
  output: {schema: GenerateResumeOutputSchema},
  prompt: `You are a professional resume writer. Generate a resume based on the user's details and tailored to the job description provided.

User Details: {{{userDetails}}}

Job Description: {{{jobDescription}}}

Consider the job description to highlight relevant skills and experiences. Provide an ATS score reflecting the match between the generated resume and the job description. Also, provide improvement suggestions to enhance the resume's effectiveness.

Ensure the resume is visually appealing and easy to read. Include all relevant sections such as work experience, education, skills, projects, and certifications.

Output the resume, ATS score, and improvement suggestions.
`,
});

const generateResumeFlow = ai.defineFlow(
  {
    name: 'generateResumeFlow',
    inputSchema: GenerateResumeInputSchema,
    outputSchema: GenerateResumeOutputSchema,
  },
  async input => {
    const {apiKey, ...rest} = input;
    const model = googleAI({apiKey});
    const {output} = await ai.generate({
      prompt: resumePrompt.prompt,
      model: model.model('gemini-2.0-flash'),
      output: {
        schema: resumePrompt.output.schema!,
      },
      input: rest,
    });
    return output!;
  }
);
