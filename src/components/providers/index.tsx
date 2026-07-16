'use client'

import { ThemeProvider } from './theme'
import { QueryClientProvider } from './query-client'
import { SupabaseProvider } from './supabase-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <QueryClientProvider>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SupabaseProvider>
  )
}
