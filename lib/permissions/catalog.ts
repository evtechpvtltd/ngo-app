import { z } from "zod";

/**
 * Permission catalog. This MUST stay in sync with supabase/seed/seed.sql —
 * the database is authoritative for what a role actually grants, but the
 * app needs a typed reference so `hasPermission(user, "gallery.read")`
 * calls are checked at compile time.
 */
export const PERMISSIONS = [
  "gallery.read",
  "gallery.create",
  "gallery.update",
  "gallery.delete",
  "video.read",
  "video.upload",
  "video.update_own",
  "video.delete_own",
  "video.moderate",
  "review.read",
  "review.create",
  "review.update_own",
  "review.delete_own",
  "review.moderate",
  "event.read",
  "event.create",
  "event.update",
  "event.publish",
  "event.delete",
  "livestream.read",
  "livestream.create",
  "livestream.broadcast",
  "livestream.end",
  "livestream.manage",
  "payment.create",
  "payment.read_own",
  "payment.read_all",
  "payment.refund",
  "user.read",
  "user.manage",
  "role.assign",
  "audit.read",
  "system.manage",
] as const;

export const permissionSchema = z.enum(PERMISSIONS);
export type Permission = z.infer<typeof permissionSchema>;

export const ROLES = [
  "member",
  "moderator",
  "content_manager",
  "event_manager",
  "finance_manager",
  "admin",
  "super_admin",
] as const;

export const roleSchema = z.enum(ROLES);
export type Role = z.infer<typeof roleSchema>;
