/**
 * OfflineBanner component displays when network connection is lost
 * Shows a persistent banner at the top of the screen
 */

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Displays a warning banner when the user is offline
 * Automatically shows/hides based on network connectivity
 * 
 * @example
 * <Layout>
 *   <OfflineBanner />
 *   <AppContent />
 * </Layout>
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-3 shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="container flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4" />
        <span>No internet connection. Some features may be unavailable.</span>
      </div>
    </div>
  );
}
