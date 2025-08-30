'use client';

import React, { useState, useTransition, useEffect } from 'react';
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
  
  // This state is just to trigger re-renders when the key changes.
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check for API key in localStorage on mount.
    // This is primarily for the dev environment. In production,
    // the server should use the environment variable.
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);


  const handleGeneration = () => {
    // In production, the server should have the API key.
    // For local dev, we check local storage.
    const hasApiKey = !!localStorage.getItem('gemini_api_key') || !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!hasApiKey && process.env.NODE_ENV === 'development') {
       toast({
        variant: 'destructive',
        title: 'API Key Not Set',
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
      console.error(validation.error.flatten().fieldErrors);
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
        
        // We no longer need to pass the API key to actions.
        // The server will use the environment variable.
        const [resumeResult, atsResult, coverLetterResult] = await Promise.all([
          generateResumeAction(validation.data, jobDescription),
          calculateAtsScoreAction(validation.data, jobDescription),
          generateCoverLetterAction(validation.data, jobDescription)
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
          description: error instanceof Error ? error.message : 'An error occurred while generating content. Please check your API key and try again.',
        });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header onApiKeyUpdate={() => setApiKey(localStorage.getItem('gemini_api_key'))} />
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
