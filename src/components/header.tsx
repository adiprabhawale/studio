'use client';

import React, { useState } from 'react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { ApiKeyDialog } from './api-key-dialog';
import { KeyRound } from 'lucide-react';

interface HeaderProps {
  onApiKeyUpdate: () => void;
}

export function Header({ onApiKeyUpdate }: HeaderProps) {
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="mr-4 flex items-center">
            <Logo />
            <h1 className="text-xl font-bold font-headline ml-2">
              Tailored Resume Pro
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsApiDialogOpen(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Set API Key
          </Button>
        </div>
      </header>
      <ApiKeyDialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen} onApiKeySet={onApiKeyUpdate} />
    </>
  );
}
