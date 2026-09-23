# supabase/functions/

Reserved for Supabase Edge Functions — privileged backend execution that
doesn't fit a Next.js Route Handler (e.g. a webhook receiver that must run
close to the database, or heavy media processing). Empty in v0.0.1; both
existing endpoints (`/api/v1/health`, `/api/v1/system/version`) are plain
Next.js Route Handlers.
