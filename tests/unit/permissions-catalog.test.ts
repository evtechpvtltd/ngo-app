import { describe, expect, it } from "vitest";
import { PERMISSIONS, ROLES, permissionSchema, roleSchema } from "@/lib/permissions/catalog";

describe("lib/permissions/catalog", () => {
  it("has no duplicate permission keys", () => {
    expect(new Set(PERMISSIONS).size).toBe(PERMISSIONS.length);
  });

  it("has no duplicate role keys", () => {
    expect(new Set(ROLES).size).toBe(ROLES.length);
  });

  it("every permission key follows the <domain>.<action> convention", () => {
    for (const permission of PERMISSIONS) {
      expect(permission).toMatch(/^[a-z]+\.[a-z_]+$/);
    }
  });

  it("accepts a known permission and rejects an unknown one", () => {
    expect(permissionSchema.safeParse("audit.read").success).toBe(true);
    expect(permissionSchema.safeParse("not.a_permission").success).toBe(false);
  });

  it("accepts a known role and rejects an unknown one", () => {
    expect(roleSchema.safeParse("super_admin").success).toBe(true);
    expect(roleSchema.safeParse("root").success).toBe(false);
  });

  it("includes the mandatory initial roles from app.md #7", () => {
    for (const role of [
      "member",
      "moderator",
      "content_manager",
      "event_manager",
      "finance_manager",
      "admin",
      "super_admin",
    ]) {
      expect(ROLES).toContain(role);
    }
  });
});
