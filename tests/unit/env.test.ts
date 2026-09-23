import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const VALID_PUBLIC_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_VERSION: "0.0.1",
};

describe("lib/config/env.public", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("parses valid public environment variables", async () => {
    Object.assign(process.env, VALID_PUBLIC_ENV);
    const { publicEnv } = await import("@/lib/config/env.public");
    expect(publicEnv.NEXT_PUBLIC_SUPABASE_URL).toBe(VALID_PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_URL);
  });

  it("fails fast when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    Object.assign(process.env, { ...VALID_PUBLIC_ENV, NEXT_PUBLIC_SUPABASE_URL: undefined });
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    await expect(import("@/lib/config/env.public")).rejects.toThrow(
      /Invalid public environment variables/,
    );
  });

  it("fails fast when NEXT_PUBLIC_SUPABASE_URL is not a URL", async () => {
    Object.assign(process.env, { ...VALID_PUBLIC_ENV, NEXT_PUBLIC_SUPABASE_URL: "not-a-url" });

    await expect(import("@/lib/config/env.public")).rejects.toThrow(
      /Invalid public environment variables/,
    );
  });

  it("defaults NEXT_PUBLIC_APP_VERSION when unset", async () => {
    const { NEXT_PUBLIC_APP_VERSION, ...rest } = VALID_PUBLIC_ENV;
    void NEXT_PUBLIC_APP_VERSION;
    Object.assign(process.env, rest);
    delete process.env.NEXT_PUBLIC_APP_VERSION;

    const { publicEnv } = await import("@/lib/config/env.public");
    expect(publicEnv.NEXT_PUBLIC_APP_VERSION).toBe("0.0.1");
  });
});
