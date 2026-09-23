"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/pwa/use-online-status";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 bg-secondary px-4 py-2 text-sm text-secondary-foreground"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>You&rsquo;re offline. Safe changes will sync automatically.</span>
    </div>
  );
}
