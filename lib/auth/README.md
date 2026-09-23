# lib/auth/

Reserved for client-side auth helpers (sign-in/sign-up forms, session
hooks, MFA UI helpers) once real authentication UI is built. Session
validation and permission checks already exist today in
`server/policies/authorize.ts` and the three clients in
`lib/supabase/` — this directory is for the presentation-layer pieces that
don't exist yet in v0.0.1.
