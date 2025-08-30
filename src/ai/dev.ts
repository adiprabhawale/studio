import { config } from 'dotenv';
config();

import '@/ai/flows/resume-parsing';
import '@/ai/flows/job-description-analysis';
import '@/ai/flows/resume-generation';
import '@/ai/flows/ats-score-calculation';
import '@/ai/flows/cover-letter-generation';
