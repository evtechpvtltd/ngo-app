import { apiError, apiSuccess, getRequestId } from "@/lib/api/response";
import { publicEnv } from "@/lib/config/env.public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging/logger";

/**
 * GET /api/v1/system/version
 *
 * Backs the self-update contract (app.md #16). Reads the latest row from
 * public.app_versions (public read policy — see 0001_init.sql). Falls back
 * to the build-time version if the table is unreachable so the endpoint
 * degrades gracefully rather than failing update checks entirely.
 */
export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("app_versions")
      .select("version, build_id, minimum_supported_version, update_type")
      .order("released_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return apiSuccess(
        {
          version: publicEnv.NEXT_PUBLIC_APP_VERSION,
          minimum_supported_version: publicEnv.NEXT_PUBLIC_APP_VERSION,
          update_type: "none" as const,
        },
        requestId,
      );
    }

    return apiSuccess(data, requestId);
  } catch (error) {
    logger.error("Failed to read app_versions", {
      request_id: requestId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return apiError(
      "INTERNAL_ERROR",
      "Unable to determine the current version at this time.",
      requestId,
    );
  }
}
