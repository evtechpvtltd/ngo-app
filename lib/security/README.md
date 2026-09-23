# lib/security/

Reserved for cross-cutting security helpers not yet needed: rate limiting,
CSRF helpers beyond what Next.js Server Actions provide by default, and
input-sanitization utilities for rich text once reviews/content editing
exist. See `docs/security.md #4` for the tracked gap (no rate limiting
yet — there are no mutating endpoints to protect).
