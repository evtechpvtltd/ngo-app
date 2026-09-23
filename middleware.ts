import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Generates a per-request CSP nonce and forwards it to Server Components via
 * a request header (read in app/layout.tsx) so inline scripts can use
 * `nonce-<value>` instead of `'unsafe-inline'`.
 *
 * See docs/security.md#content-security-policy for the documented exceptions
 * (Supabase connect-src, dev-only websocket/eval allowances).
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const connectSrc = ["'self'", "https://*.supabase.co", "wss://*.supabase.co"];
  if (isDev) {
    connectSrc.push("ws://localhost:*", "http://localhost:*");
  }

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://*.supabase.co`,
    `font-src 'self' data:`,
    `connect-src ${connectSrc.join(" ")}`,
    `media-src 'self' blob: https://*.supabase.co`,
    `worker-src 'self'`,
    `manifest-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-request-id", crypto.randomUUID());

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-request-id", requestHeaders.get("x-request-id")!);

  return response;
}

export const config = {
  matcher: [
    // Skip static assets and the service worker; apply to everything else.
    "/((?!_next/static|_next/image|favicon.ico|sw.js|icons/).*)",
  ],
};
