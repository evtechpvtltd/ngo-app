"use client";

import { useEffect, useState } from "react";

/**
 * Tracks browser online/offline state for the native-feeling offline
 * indicator (app.md #17). Defaults to `true` during SSR/initial render to
 * avoid a flash of "offline" before hydration can read navigator.onLine.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
