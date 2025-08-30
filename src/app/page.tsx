
'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserProfileForm } from '@/components/user-profile-form';
import { JobDescriptionSection } from '@/components/job-description-section';
import { GeneratedContent } from '@/components/generated-content';
import { Header } from '@/components/header';
import { UserProfile, userProfileSchema } from '@/lib/types';
import {
  generateResumeAction,
  calculateAtsScoreAction,
  generateCoverLetterAction,
} from '@/lib/actions';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  
  const [generatedResume, setGeneratedResume] = useState<string>('');
  const [atsScore, setAtsScore] = useState<{ score: number; suggestions: string[] } | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>('');

  const getApiKey = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key');
    }
    return null;
  };

  const handleGeneration = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Missing',
        description: 'Please set your Gemini API key in the header before generating content.',
      });
      return;
    }

    if (!userProfile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out your profile first.',
      });
      return;
    }

    const validation = userProfileSchema.safeParse(userProfile);
    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: 'Profile Incomplete',
        description: 'Please ensure all required profile fields are filled correctly.',
      });
      console.error('Profile validation failed:', validation.error.flatten().fieldErrors);
      return;
    }

    if (!jobDescription) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a job description.',
      });
      return;
    }

    startTransition(async () => {
      try {
        toast({ title: 'Generating Content...', description: 'AI is working its magic. Please wait.' });
        
        const [resumeResult, atsResult, coverLetterResult] = await Promise.all([
          generateResumeAction(validation.data, jobDescription, apiKey),
          calculateAtsScoreAction(validation.data, jobDescription, apiKey),
          generateCoverLetterAction(validation.data, jobDescription, apiKey)
        ]);

        setGeneratedResume(resumeResult.resume);
        setAtsScore({ score: atsResult.atsScore, suggestions: atsResult.suggestions });
        setCoverLetter(coverLetterResult.coverLetter);

        toast({ title: 'Success!', description: 'Your tailored content has been generated.' });
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: error instanceof Error ? error.message : 'An error occurred. Please check your API key and server logs, then try again.',
        });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 space-y-8 lg:space-y-0">
          <div className="space-y-8">
            <UserProfileForm onProfileChange={setUserProfile} />
            <JobDescriptionSection onJobDescriptionChange={setJobDescription} />
          </div>
          <div className="flex flex-col gap-8">
            <Button onClick={handleGeneration} disabled={isPending} size="lg" className="w-full font-headline">
              <Sparkles className="mr-2 h-5 w-5" />
              {isPending ? 'Generating...' : 'Generate Tailored Content'}
            </Button>
            <GeneratedContent
              resume={generatedResume}
              atsScore={atsScore}
              coverLetter={coverLetter}
              setCoverLetter={setCoverLetter}
              isLoading={isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
