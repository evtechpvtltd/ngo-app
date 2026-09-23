import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/v1/health/route";

describe("GET /api/v1/health", () => {
  it("returns ok status with the canonical response envelope", async () => {
    const request = new Request("http://localhost/api/v1/health");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.data.status).toBe("ok");
    expect(body.meta.api_version).toBe("v1");
  });

  it("never leaks internal fields like DB host or secrets", async () => {
    const request = new Request("http://localhost/api/v1/health");
    const response = await GET(request);
    const text = await response.text();

    expect(text).not.toMatch(/supabase\.co/i);
    expect(text).not.toMatch(/service_role/i);
  });
});
