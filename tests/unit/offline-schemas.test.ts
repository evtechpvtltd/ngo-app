import { describe, expect, it } from "vitest";
import { queuedMutationSchema, FORBIDDEN_OFFLINE_MUTATION_TYPES } from "@/lib/offline/schemas";

function validMutation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "8c9b6b1e-8e0a-4a3a-9c3b-0d6f6c9a1b2c",
    type: "review.create_draft",
    schema_version: 1,
    user_id: "8c9b6b1e-8e0a-4a3a-9c3b-0d6f6c9a1b2d",
    created_at: new Date().toISOString(),
    payload: { body: "great event" },
    idempotency_key: "8c9b6b1e-8e0a-4a3a-9c3b-0d6f6c9a1b2e",
    retry_count: 0,
    last_error: null,
    status: "pending",
    ...overrides,
  };
}

describe("lib/offline/schemas", () => {
  it("accepts a well-formed queued mutation", () => {
    expect(queuedMutationSchema.safeParse(validMutation()).success).toBe(true);
  });

  it("rejects a mutation with a non-UUID id", () => {
    expect(queuedMutationSchema.safeParse(validMutation({ id: "not-a-uuid" })).success).toBe(
      false,
    );
  });

  it("rejects an unknown status", () => {
    expect(
      queuedMutationSchema.safeParse(validMutation({ status: "done" })).success,
    ).toBe(false);
  });

  it("rejects a negative retry_count", () => {
    expect(
      queuedMutationSchema.safeParse(validMutation({ retry_count: -1 })).success,
    ).toBe(false);
  });

  it("documents at least the security-sensitive operations from app.md #3.3", () => {
    for (const type of ["payment.confirm", "role.change", "moderation.decide"]) {
      expect(FORBIDDEN_OFFLINE_MUTATION_TYPES).toContain(type);
    }
  });
});
