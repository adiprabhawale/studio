'use client';

import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText, Bot, PenSquare } from 'lucide-react';

interface GeneratedContentProps {
  resume: string;
  atsScore: { score: number; suggestions: string[] } | null;
  coverLetter: string;
  setCoverLetter: (cl: string) => void;
  isLoading: boolean;
}

export function GeneratedContent({
  resume,
  atsScore,
  coverLetter,
  setCoverLetter,
  isLoading,
}: GeneratedContentProps) {
  const resumePrintRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    const printContent = resumePrintRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printContents = printContent.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // to re-attach event listeners
    }
  };

  const LoadingState = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-8 w-1/4 mt-4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline">Generated Content</CardTitle>
        </div>
        <CardDescription>
          Here is your AI-generated resume, ATS score, and cover letter.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Tabs defaultValue="resume" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resume">
              <FileText className="w-4 h-4 mr-2" /> Resume
            </TabsTrigger>
            <TabsTrigger value="ats-score">
              <div className="flex items-center">
                 <Bot className="w-4 h-4 mr-2" /> ATS Score
                 {atsScore && <Badge variant="secondary" className="ml-2">{atsScore.score}</Badge>}
              </div>
            </TabsTrigger>
            <TabsTrigger value="cover-letter">
              <PenSquare className="w-4 h-4 mr-2" /> Cover Letter
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="resume" className="flex-1 mt-4">
            <div className="border rounded-lg p-6 bg-secondary/30 min-h-[300px] prose prose-sm max-w-none dark:prose-invert">
              {isLoading ? <LoadingState /> : <pre className="whitespace-pre-wrap font-body text-sm">{resume || "Your generated resume will appear here."}</pre>}
            </div>
            <Button onClick={handlePrint} disabled={!resume} className="mt-4 w-full">
              <Download className="mr-2 h-4 w-4" /> Download as PDF
            </Button>
            <div className="hidden">
              <div ref={resumePrintRef}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'sans-serif', fontSize: '12px' }}>{resume}</pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ats-score" className="flex-1 mt-4 space-y-4">
            {isLoading ? <LoadingState /> : (
              !atsScore ? <p>Your ATS score and suggestions will appear here.</p> : (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">ATS Compatibility Score</h3>
                      <span className="text-2xl font-bold text-primary">{atsScore.score}/100</span>
                    </div>
                    <Progress value={atsScore.score} className="w-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Improvement Suggestions</h3>
                    <ul className="space-y-2 list-disc list-inside bg-secondary/30 p-4 rounded-md">
                      {atsScore.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </>
              )
            )}
          </TabsContent>

          <TabsContent value="cover-letter" className="flex-1 flex flex-col mt-4">
             {isLoading ? <LoadingState /> : (
               <Textarea
                 value={coverLetter}
                 onChange={(e) => setCoverLetter(e.target.value)}
                 placeholder="Your generated cover letter will appear here. You can edit it directly."
                 className="flex-1 min-h-[400px] text-base"
               />
             )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
