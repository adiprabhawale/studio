
'use server';

/**
 * @fileOverview A resume parsing AI agent.
 *
 * - parseResume - A function that handles the resume parsing process.
 * - ParseResumeInput - The input type for the parseResume function.
 * - ParseResumeOutput - The return type for the parseResume function.
 */

import { genkit, Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const ParseResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume file (PDF or DOCX) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  apiKey: z.string().optional().describe("The user's Gemini API key."),
});
export type ParseResumeInput = z.infer<typeof ParseResumeInputSchema>;

const WorkExperienceSchema = z.object({
  jobTitle: z.string().describe('The job title.'),
  company: z.string().describe('The company name.'),
  startDate: z.string().describe('The start date of the employment.'),
  endDate: z.string().describe('The end date of the employment.'),
  description: z.string().describe('The description of the work experience.'),
});

const EducationSchema = z.object({
  institution: z.string().describe('The name of the institution.'),
  degree: z.string().describe('The degree obtained.'),
  fieldOfStudy: z.string().describe('The field of study.'),
  graduationDate: z.string().describe('The graduation date.'),
});

const ProjectSchema = z.object({
  name: z.string().describe('The name of the project.'),
  description: z.string().describe('The description of the project.'),
  url: z.string().optional().describe('The URL of the project.'),
});

const CertificationSchema = z.object({
  name: z.string().describe('The name of the certification.'),
  issuingOrganization: z.string().describe('The issuing organization.'),
  dateEarned: z.string().describe('The date the certification was earned.'),
});

const ParseResumeOutputSchema = z.object({
  name: z.string().describe('The name of the person.'),
  email: z.string().email().describe('The email address of the person.'),
  phone: z.string().describe('The phone number of the person.'),
  experience: z.array(WorkExperienceSchema).describe('List of work experiences.'),
  education: z.array(EducationSchema).describe('List of educational qualifications.'),
  skills: z.array(z.string()).describe('List of skills.'),
  projects: z.array(ProjectSchema).describe('List of projects.'),
  certifications: z.array(CertificationSchema).describe('List of certifications.'),
});
export type ParseResumeOutput = z.infer<typeof ParseResumeOutputSchema>;

export async function parseResume(input: ParseResumeInput): Promise<ParseResumeOutput> {
  const plugins: Plugin<any>[] = [];
  if (input.apiKey) {
    plugins.push(googleAI({ apiKey: input.apiKey }));
  } else if (process.env.GEMINI_API_KEY) {
    plugins.push(googleAI({ apiKey: process.env.GEMINI_API_KEY }));
  } else {
    throw new Error('API key is not provided.');
  }

  const ai = genkit({ plugins });
  
  const prompt = ai.definePrompt({
    name: 'resumeParsingPrompt',
    model: googleAI.model('gemini-1.5-flash'),
    input: { schema: ParseResumeInputSchema },
    output: { schema: ParseResumeOutputSchema },
    prompt: `You are an expert resume parser. Your job is to extract information from a resume.

    Extract the following information from the resume:
    - Name
    - Email
    - Phone number
    - Work experience. Make sure to capture all details for each position including job title, company, dates and description into a single experience item.
    - Education
    - Skills
    - Projects
    - Certifications

    Here is the resume:
    {{media url=resumeDataUri}}
  `,
  });

  const { output } = await prompt({
    resumeDataUri: input.resumeDataUri,
    apiKey: input.apiKey,
  });

  return output!;
}
