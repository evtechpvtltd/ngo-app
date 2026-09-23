import "server-only";
import { z } from "zod";

/**
 * Server-only secrets. The `server-only` import above makes Next.js throw a
 * build error if any client component transitively imports this module —
 * that is the structural guarantee, not just convention.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required for privileged server operations"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_BUILD_ID: z.string().default("dev"),
});

function loadServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
    APP_BUILD_ID: process.env.APP_BUILD_ID,
  });

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    throw new Error(
      `Invalid server environment variables:\n${JSON.stringify(formatted, null, 2)}\n\nCheck .env.example and your .env.local file. This must never be logged in a way that could leak values.`,
    );
  }

  return parsed.data;
}

export const serverEnv = loadServerEnv();
export type ServerEnv = typeof serverEnv;
