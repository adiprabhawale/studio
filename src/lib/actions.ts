
'use server';

import { parseResume } from '@/ai/flows/resume-parsing';
import { analyzeJobDescription } from '@/ai/flows/job-description-analysis';
import { generateResume } from '@/ai/flows/resume-generation';
import { calculateAtsScore } from '@/ai/flows/ats-score-calculation';
import { generateCoverLetter } from '@/ai/flows/cover-letter-generation';
import type { UserProfile } from './types';


export async function parseResumeAction(resumeDataUri: string, apiKey: string) {
  const result = await parseResume({ resumeDataUri, apiKey });
  return result;
}

export async function analyzeJobDescriptionAction(jobDescription: string) {
  const result = await analyzeJobDescription({ jobDescription });
  return result;
}

function formatUserProfileForAI(profile: UserProfile): string {
    let formatted = `Name: ${profile.name}\nEmail: ${profile.email}\nPhone: ${profile.phone}\n\n`;

    if (profile.skills?.length > 0) {
        formatted += `Skills: ${profile.skills.join(', ')}\n\n`;
    }

    if (profile.experiences?.length > 0) {
        formatted += 'Work Experience:\n';
        profile.experiences.forEach(exp => {
            formatted += `- ${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})\n`;
            if (exp.description) formatted += `  ${exp.description.replace(/\n/g, '\n  ')}\n`;
        });
        formatted += '\n';
    }

    if (profile.education?.length > 0) {
        formatted += 'Education:\n';
        profile.education.forEach(edu => {
            formatted += `- ${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution} (Graduated: ${edu.graduationDate})\n`;
        });
        formatted += '\n';
    }
    
    if (profile.projects?.length > 0) {
        formatted += 'Projects:\n';
        profile.projects.forEach(proj => {
            formatted += `- ${proj.name}\n`;
            if(proj.url) formatted += `  Link: ${proj.url}\n`;
            if(proj.description) formatted += `  Description: ${proj.description.replace(/\n/g, '\n  ')}\n`;
        });
        formatted += '\n';
    }

    if (profile.certifications?.length > 0) {
        formatted += 'Certifications:\n';
        profile.certifications.forEach(cert => {
            formatted += `- ${cert.name} from ${cert.issuingOrganization} (Earned: ${cert.dateEarned})\n`;
        });
        formatted += '\n';
    }

    return formatted;
}

export async function generateResumeAction(profile: UserProfile, jobDescription: string) {
    const userDetails = formatUserProfileForAI(profile);
    const result = await generateResume({ userDetails, jobDescription });
    return result;
}

export async function calculateAtsScoreAction(profile: UserProfile, jobDescription: string) {
    const resumeText = formatUserProfileForAI(profile);
    const result = await calculateAtsScore({ resume: resumeText, jobDescription });
    return result;
}

export async function generateCoverLetterAction(profile: UserProfile, jobDescription: string) {
    const userInformation = formatUserProfileForAI(profile);
    const result = await generateCoverLetter({ jobDescription, userInformation });
    return result;
}
