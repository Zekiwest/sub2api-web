'use client';

import { Toaster } from 'react-hot-toast';
import { UIFork } from 'uifork';
import { TooltipProvider } from '@/components/ui/tooltip';

const showUIFork = process.env.NODE_ENV !== 'production';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      {showUIFork && <UIFork />}
      <Toaster position="top-right" />
    </TooltipProvider>
  );
}