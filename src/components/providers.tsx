'use client';

import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            iconTheme: {
              primary: '#1f5134',
              secondary: '#f2ecd9',
            },
          },
        }}
      />
    </TooltipProvider>
  );
}
