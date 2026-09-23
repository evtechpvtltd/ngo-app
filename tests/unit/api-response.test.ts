import { describe, expect, it } from "vitest";
import { apiSuccess, apiError, getRequestId, API_VERSION } from "@/lib/api/response";

describe("lib/api/response", () => {
  it("wraps success payloads in the canonical shape", async () => {
    const response = apiSuccess({ status: "ok" }, "req-1");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      data: { status: "ok" },
      error: null,
      meta: { request_id: "req-1", api_version: API_VERSION },
    });
  });

  it("maps each error code to the correct HTTP status", async () => {
    const unauthenticated = apiError("UNAUTHENTICATED", "nope", "req-2");
    expect(unauthenticated.status).toBe(401);

    const forbidden = apiError("FORBIDDEN", "nope", "req-3");
    expect(forbidden.status).toBe(403);

    const notFound = apiError("RESOURCE_NOT_FOUND", "nope", "req-4");
    expect(notFound.status).toBe(404);
  });

  it("never includes a stack trace in the error body", async () => {
    const response = apiError("INTERNAL_ERROR", "Something went wrong.", "req-5");
    const body = await response.json();

    expect(JSON.stringify(body)).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    expect(body.error.message).toBe("Something went wrong.");
  });

  it("falls back to a generated request id when none is supplied", () => {
    const request = new Request("http://localhost/api/v1/health");
    expect(getRequestId(request)).toMatch(/[0-9a-f-]{36}/);
  });

  it("uses the caller-supplied x-request-id header when present", () => {
    const request = new Request("http://localhost/api/v1/health", {
      headers: { "x-request-id": "custom-id" },
    });
    expect(getRequestId(request)).toBe("custom-id");
  });
});
