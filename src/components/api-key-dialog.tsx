'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySet: () => void;
}

export function ApiKeyDialog({ open, onOpenChange, onApiKeySet }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
  }, [open]);

  const handleSave = () => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
      toast({
        title: 'API Key Saved',
        description: 'Your Gemini API key has been saved to local storage for development.',
      });
      onApiKeySet(); // Notify parent component
      onOpenChange(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter an API key.',
      });
    }
  };
  
  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    toast({
      title: 'API Key Cleared',
      description: 'Your Gemini API key has been removed from local storage.',
    });
    onApiKeySet(); // Notify parent component
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="w-6 h-6" />
            <DialogTitle>Set Development API Key</DialogTitle>
          </div>
          <DialogDescription>
            Enter your Google Gemini API key for local development. This will be stored in your browser.
            In production, the app will use the `GEMINI_API_KEY` environment variable set on the server.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="password"
          placeholder="Enter your Gemini API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClear}>Clear Key</Button>
          <Button onClick={handleSave}>Save Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
