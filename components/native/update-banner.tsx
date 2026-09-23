"use client";

import { RefreshCw } from "lucide-react";
import { useServiceWorker } from "@/lib/pwa/use-service-worker";

export function UpdateBanner() {
  const { state, applyUpdate } = useServiceWorker();

  if (state !== "update_available" && state !== "update_required") {
    return null;
  }

  const isRequired = state === "update_required";

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-touch-target items-center justify-center gap-3 bg-primary px-4 py-2 text-sm text-primary-foreground"
    >
      <span>
        {isRequired
          ? "A required update is ready."
          : "A new version is available."}
      </span>
      <button
        type="button"
        onClick={applyUpdate}
        className="min-touch-target inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/40 px-3 py-1 font-medium hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        Refresh
      </button>
    </div>
  );
}
