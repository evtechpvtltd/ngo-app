"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Global error boundary. Never renders `error.message` or `error.stack` —
 * those may contain internal implementation details and are logged
 * separately, not shown to users (app.md #24).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-6">
      <Card>
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. The issue has been logged.
            {error.digest ? ` Reference: ${error.digest}.` : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={reset}
            className="min-touch-target rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
