import { describe, expect, it, vi, beforeEach } from "vitest";

// jsdom resolves package.json "browser" export conditions, which is the
// condition under which `server-only` intentionally throws. Stub it so
// importing server/policies/authorize.ts (which imports "server-only")
// doesn't trip that guard inside this test environment.
vi.mock("server-only", () => ({}));

const getUserMock = vi.fn();
const rpcMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: getUserMock },
    rpc: rpcMock,
  }),
}));

const { getAuthenticatedUser, hasPermission, requirePermission, UnauthenticatedError, ForbiddenError } =
  await import("@/server/policies/authorize");

describe("server/policies/authorize", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    rpcMock.mockReset();
  });

  it("returns null when there is no authenticated user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    expect(await getAuthenticatedUser()).toBeNull();
  });

  it("returns the user when the session is valid", async () => {
    const user = { id: "user-1" };
    getUserMock.mockResolvedValue({ data: { user }, error: null });
    expect(await getAuthenticatedUser()).toEqual(user);
  });

  it("hasPermission reflects the has_permission RPC result", async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });
    expect(await hasPermission("user-1", "audit.read")).toBe(true);

    rpcMock.mockResolvedValue({ data: false, error: null });
    expect(await hasPermission("user-1", "audit.read")).toBe(false);
  });

  it("requirePermission throws UnauthenticatedError with no session", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    await expect(requirePermission("audit.read")).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("requirePermission throws ForbiddenError when the permission is missing", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    rpcMock.mockResolvedValue({ data: false, error: null });
    await expect(requirePermission("audit.read")).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("requirePermission returns the user when authorized", async () => {
    const user = { id: "user-1" };
    getUserMock.mockResolvedValue({ data: { user }, error: null });
    rpcMock.mockResolvedValue({ data: true, error: null });
    await expect(requirePermission("audit.read")).resolves.toEqual(user);
  });
});
