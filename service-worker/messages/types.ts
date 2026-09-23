import { z } from "zod";

/**
 * Every message posted to/from the service worker is Zod-validated
 * (app.md immutable stack: "Zod for ... service-worker messages"). Add new
 * message types here as variants of this union — never accept an
 * unvalidated postMessage payload in sw.ts.
 */
export const serviceWorkerMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("SKIP_WAITING") }),
  z.object({ type: z.literal("PING") }),
]);

export type ServiceWorkerMessage = z.infer<typeof serviceWorkerMessageSchema>;
