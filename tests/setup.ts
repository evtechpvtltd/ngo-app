/**
 * Global Vitest setup: provides baseline valid environment variables so any
 * module that eagerly validates env at import time (lib/config/env.*) does
 * not throw for tests that aren't specifically exercising that validation.
 * tests/unit/env.test.ts overrides process.env per-test to test the
 * failure paths directly.
 */
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_VERSION ??= "0.0.1";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role-key";
process.env.APP_BUILD_ID ??= "test";
