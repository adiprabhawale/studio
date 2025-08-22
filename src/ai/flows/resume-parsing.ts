// src/ai/flows/resume-parsing.ts
'use server';
/**
 * @fileOverview A resume parsing AI agent.
 *
 * - parseResume - A function that handles the resume parsing process.
 * - ParseResumeInput - The input type for the parseResume function.
 * - ParseResumeOutput - The return type for the parseResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume file (PDF or DOCX) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ParseResumeInput = z.infer<typeof ParseResumeInputSchema>;

const ParseResumeOutputSchema = z.object({
  name: z.string().describe('The name of the person.'),
  email: z.string().email().describe('The email address of the person.'),
  phone: z.string().describe('The phone number of the person.'),
  experience: z.array(z.string()).describe('List of work experiences.'),
  education: z.array(z.string()).describe('List of educational qualifications.'),
  skills: z.array(z.string()).describe('List of skills.'),
  projects: z.array(z.string()).describe('List of projects.'),
  certifications: z.array(z.string()).describe('List of certifications.'),
});
export type ParseResumeOutput = z.infer<typeof ParseResumeOutputSchema>;

export async function parseResume(input: ParseResumeInput): Promise<ParseResumeOutput> {
  return parseResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseResumePrompt',
  input: {schema: ParseResumeInputSchema},
  output: {schema: ParseResumeOutputSchema},
  prompt: `You are an expert resume parser. Your job is to extract information from a resume.

  Extract the following information from the resume:
  - Name
  - Email
  - Phone number
  - Work experience
  - Education
  - Skills
  - Projects
  - Certifications

  Here is the resume:
  {{media url=resumeDataUri}}
`,
});

const parseResumeFlow = ai.defineFlow(
  {
    name: 'parseResumeFlow',
    inputSchema: ParseResumeInputSchema,
    outputSchema: ParseResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
