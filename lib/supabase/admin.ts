import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/config/env.public";
import { serverEnv } from "@/lib/config/env.server";
import type { Database } from "@/lib/supabase/types";

/**
 * Privileged Supabase client using the SERVICE ROLE key — bypasses RLS
 * entirely. This is intentionally hard to reach from the wrong place:
 *
 *   1. `import "server-only"` fails the build if a Client Component
 *      transitively imports this module.
 *   2. The runtime check below throws if somehow evaluated where `window`
 *      exists (belt-and-braces against bundler misconfiguration).
 *   3. eslint.config.mjs blocks importing this path from app/**, components/**
 *      and features/** (except app/api/**).
 *
 * Use ONLY from server/ services, Route Handlers, and Edge Functions that
 * have already performed their own authorization check — this client does
 * not know or care who the caller is.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "lib/supabase/admin.ts must never be imported into browser-executed code.",
  );
}

let cachedAdminClient: ReturnType<typeof createClient<Database>> | null = null;

export function createSupabaseAdminClient() {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  cachedAdminClient = createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return cachedAdminClient;
}
