import React from 'react';
import { Logo } from './logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Logo />
          <h1 className="text-xl font-bold font-headline ml-2">
            Tailored Resume Pro
          </h1>
        </div>
      </div>
    </header>
  );
}
