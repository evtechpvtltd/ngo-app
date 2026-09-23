import { describe, expect, it } from "vitest";
import { registerMutationHandler, enqueueMutation } from "@/lib/offline/mutation-queue";

describe("lib/offline/mutation-queue guards", () => {
  it("refuses to register a handler for a security-sensitive mutation type", () => {
    expect(() => registerMutationHandler("payment.confirm", async () => {})).toThrow(
      /security-sensitive/,
    );
  });

  it("refuses to enqueue a security-sensitive mutation type", async () => {
    await expect(
      enqueueMutation({
        id: "8c9b6b1e-8e0a-4a3a-9c3b-0d6f6c9a1b2c",
        type: "role.change",
        schema_version: 1,
        user_id: null,
        created_at: new Date().toISOString(),
        payload: {},
        idempotency_key: "8c9b6b1e-8e0a-4a3a-9c3b-0d6f6c9a1b2d",
      }),
    ).rejects.toThrow(/security-sensitive/);
  });
});
