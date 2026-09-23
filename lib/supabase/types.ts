/**
 * Hand-written Supabase Database types for v0.0.1's platform schema
 * (supabase/migrations/0001_init.sql). Once the Supabase CLI can reach a
 * live project, prefer generating this file instead:
 *
 *   supabase gen types typescript --local > lib/supabase/types.ts
 *
 * Kept minimal and manually in sync until then — there are no domain
 * tables (gallery/video/etc.) yet. `Relationships: []` is required on
 * every table by @supabase/postgrest-js's GenericTable constraint even
 * when (as here) there are no foreign-key-based embeds defined.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          key: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          key: string;
          name: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          key: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          key: string;
          description?: string | null;
        };
        Update: {
          description?: string | null;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: { role_id: string; permission_id: string; created_at: string };
        Insert: { role_id: string; permission_id: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role_id: string;
          granted_by: string | null;
          created_at: string;
        };
        Insert: { user_id: string; role_id: string; granted_by?: string | null };
        Update: Record<string, never>;
        Relationships: [];
      };
      app_versions: {
        Row: {
          id: string;
          version: string;
          build_id: string;
          minimum_supported_version: string;
          update_type: "none" | "optional" | "recommended" | "required";
          release_notes: string | null;
          released_at: string;
        };
        Insert: {
          version: string;
          build_id: string;
          minimum_supported_version: string;
          update_type?: "none" | "optional" | "recommended" | "required";
          release_notes?: string | null;
        };
        Update: {
          update_type?: "none" | "optional" | "recommended" | "required";
          release_notes?: string | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          request_id: string | null;
          actor_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          result: "success" | "failure";
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          request_id?: string | null;
          actor_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          result: "success" | "failure";
          metadata?: Record<string, unknown>;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      security_events: {
        Row: {
          id: string;
          event_type: string;
          severity: "info" | "warning" | "critical";
          actor_id: string | null;
          request_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          event_type: string;
          severity: "info" | "warning" | "critical";
          actor_id?: string | null;
          request_id?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_permission: {
        Args: { p_user_id: string; p_permission_key: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
