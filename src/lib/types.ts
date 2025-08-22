import { z } from 'zod';

export const workExperienceSchema = z.object({
  id: z.string().optional(),
  jobTitle: z.string().default(''),
  company: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  description: z.string().default(''),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().default(''),
  degree: z.string().default(''),
  fieldOfStudy: z.string().default(''),
  graduationDate: z.string().default(''),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(''),
  description: z.string().default(''),
  url: z.string().url().optional().or(z.literal('')),
});

export const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(''),
  issuingOrganization: z.string().default(''),
  dateEarned: z.string().default(''),
});

export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().default(''),
  experiences: z.array(workExperienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(projectSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationSchema>;
