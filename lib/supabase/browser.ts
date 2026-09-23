"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/config/env.public";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser Supabase client. Uses the anon key only — every table it can
 * reach MUST be protected by RLS (see supabase/migrations and docs/security.md).
 * This client is per-call, not a shared singleton, to avoid stale-session
 * bugs across client navigations.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
