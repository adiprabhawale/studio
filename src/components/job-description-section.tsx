'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyzeJobDescriptionAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, Sparkles, BrainCircuit } from 'lucide-react';
import type { AnalyzeJobDescriptionOutput } from '@/ai/flows/job-description-analysis';

interface JobDescriptionSectionProps {
  onJobDescriptionChange: (description: string) => void;
}

export function JobDescriptionSection({ onJobDescriptionChange }: JobDescriptionSectionProps) {
  const [isAnalyzing, startAnalyzing] = useTransition();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeJobDescriptionOutput | null>(null);

  const handleAnalyze = () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      toast({ variant: 'destructive', title: 'API Key Missing', description: 'Please set your Gemini API key in the header.' });
      return;
    }
    if (!description) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please paste a job description.' });
      return;
    }
    const apiKey = localStorage.getItem('gemini_api_key');
     if (!apiKey) {
       toast({
        variant: 'destructive',
        title: 'API Key Not Set',
        description: 'Please set your Gemini API key in the header before analyzing.',
      });
      return;
    }

    startAnalyzing(async () => {
      try {
        toast({ title: 'Analyzing...', description: 'Extracting key details from the job description.' });
        const result = await analyzeJobDescriptionAction(description, apiKey);
        setAnalysis(result);
        toast({ title: 'Analysis complete!', description: 'Identified key skills, qualifications, and keywords.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the job description. Check your API key.' });
      }
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    onJobDescriptionChange(e.target.value);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline">Job Description</CardTitle>
        </div>
        <CardDescription>Paste the job description here to analyze it for keywords.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste job description here..."
          className="min-h-[200px] text-base"
          value={description}
          onChange={handleTextChange}
        />
        <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Job Description'}
        </Button>
        {analysis && (
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold flex items-center gap-2"><BrainCircuit className="w-5 h-5" /> AI Analysis Results</h3>
            {analysis.skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Key Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill, i) => <Badge key={i} variant="secondary">{skill}</Badge>)}
                </div>
              </div>
            )}
            {analysis.qualifications.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Qualifications</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.qualifications.map((q, i) => <Badge key={i} variant="secondary">{q}</Badge>)}
                </div>
              </div>
            )}
            {analysis.keywords.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((kw, i) => <Badge key={i} variant="secondary">{kw}</Badge>)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
