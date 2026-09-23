"use client";

import { useEffect } from "react";
import { OfflineIndicator } from "@/components/native/offline-indicator";
import { UpdateBanner } from "@/components/native/update-banner";
import { initForegroundSyncFallback } from "@/lib/pwa/sync";

/**
 * App-wide shell: safe-area padding, offline/update status surfaces, and
 * the foreground sync fallback (app.md #17, #21). Kept intentionally thin
 * for v0.0.1 — no navigation chrome yet since there are no member/admin
 * routes to link to.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    return initForegroundSyncFallback();
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <UpdateBanner />
      <OfflineIndicator />
      <main
        className="flex-1"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {children}
      </main>
    </div>
  );
}
