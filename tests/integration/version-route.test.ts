import { describe, expect, it, vi, beforeEach } from "vitest";

const maybeSingleMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => ({
            maybeSingle: maybeSingleMock,
          }),
        }),
      }),
    }),
  }),
}));

const { GET } = await import("@/app/api/v1/system/version/route");

describe("GET /api/v1/system/version", () => {
  beforeEach(() => {
    maybeSingleMock.mockReset();
  });

  it("returns the latest row from app_versions", async () => {
    maybeSingleMock.mockResolvedValue({
      data: {
        version: "0.0.1",
        build_id: "abc123",
        minimum_supported_version: "0.0.1",
        update_type: "none",
      },
      error: null,
    });

    const response = await GET(new Request("http://localhost/api/v1/system/version"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.update_type).toBe("none");
  });

  it("falls back to the build-time version when no row exists", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });

    const response = await GET(new Request("http://localhost/api/v1/system/version"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.update_type).toBe("none");
    expect(body.data.version).toBeTruthy();
  });

  it("returns a generic INTERNAL_ERROR without leaking the DB error on failure", async () => {
    maybeSingleMock.mockResolvedValue({
      data: null,
      error: { message: "relation app_versions does not exist" },
    });

    const response = await GET(new Request("http://localhost/api/v1/system/version"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(body)).not.toMatch(/relation app_versions/);
  });
});
