/**
 * Hook for detecting online/offline status
 * Returns true when connected, false when offline
 */

import { useState, useEffect } from 'react';

/**
 * Monitors the browser's network connection status
 * 
 * @returns boolean indicating online status
 * 
 * @example
 * const isOnline = useOnlineStatus();
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
