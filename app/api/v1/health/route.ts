import { apiSuccess, getRequestId } from "@/lib/api/response";
import { publicEnv } from "@/lib/config/env.public";

/**
 * GET /api/v1/health
 *
 * Liveness check only — intentionally returns nothing beyond app version
 * and status. Never expose DB credentials, hostnames, or dependency
 * versions here (app.md #16).
 */
export async function GET(request: Request) {
  const requestId = getRequestId(request);

  return apiSuccess(
    { status: "ok", version: publicEnv.NEXT_PUBLIC_APP_VERSION },
    requestId,
  );
}
