import { config } from 'dotenv';
config();

import '@/ai/flows/resume-parsing.ts';
import '@/ai/flows/job-description-analysis.ts';
import '@/ai/flows/resume-generation.ts';
import '@/ai/flows/ats-score-calculation.ts';
import '@/ai/flows/cover-letter-generation.ts';