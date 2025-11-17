import { Header } from './Header';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component with header and content area
 * 
 * Note: main element has no container constraint - pages control their own max-widths
 * to allow flexible layouts (e.g., full-width chat with sidebar on desktop)
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OfflineBanner />
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
