import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export const API_VERSION = "v1" as const;

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const ERROR_STATUS: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 422,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  RESOURCE_NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

interface Meta {
  request_id: string;
  api_version: typeof API_VERSION;
  [key: string]: unknown;
}

export interface ApiSuccessBody<T> {
  data: T;
  error: null;
  meta: Meta;
}

export interface ApiErrorBody {
  data: null;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
  meta: Meta;
}

function buildMeta(requestId: string, extra?: Record<string, unknown>): Meta {
  return { request_id: requestId, api_version: API_VERSION, ...extra };
}

export function apiSuccess<T>(
  data: T,
  requestId: string,
  init?: { status?: number; meta?: Record<string, unknown> },
): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json(
    { data, error: null, meta: buildMeta(requestId, init?.meta) },
    { status: init?.status ?? 200 },
  );
}

/**
 * Never pass raw internal exception messages/stacks here for
 * INTERNAL_ERROR — log them server-side (lib/logging) and return a generic
 * message to the client instead.
 */
export function apiError(
  code: ApiErrorCode,
  message: string,
  requestId: string,
  details?: unknown,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      data: null,
      error: { code, message, ...(details !== undefined ? { details } : {}) },
      meta: buildMeta(requestId),
    },
    { status: ERROR_STATUS[code] },
  );
}

export function apiValidationError(
  zodError: ZodError,
  requestId: string,
): NextResponse<ApiErrorBody> {
  return apiError(
    "VALIDATION_ERROR",
    "Request payload failed validation.",
    requestId,
    zodError.flatten(),
  );
}

export function getRequestId(request: Request): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}
