import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/config/env.public";
import type { Database } from "@/lib/supabase/types";

/**
 * Server Component / Route Handler / Server Action Supabase client. Still
 * uses the anon key and is still subject to RLS — this is the user's own
 * authenticated session on the server, not a privilege escalation. Use
 * lib/supabase/admin.ts only when RLS must be intentionally bypassed.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component during render, where cookie
            // writes are not permitted. Session refresh middleware handles
            // this case instead — safe to ignore here.
          }
        },
      },
    },
  );
}
