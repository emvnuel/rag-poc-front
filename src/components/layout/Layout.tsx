import { Header } from './Header';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component with header and content area
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <Header />
      <main className="container py-6 px-4">{children}</main>
    </div>
  );
}
