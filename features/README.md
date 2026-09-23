# features/

Reserved for feature modules (e.g. `gallery/`, `videos/`, `reviews/`,
`events/`, `livestreams/`, `payments/`) as they're built. Empty in v0.0.1 —
no domain feature exists yet. Each future module should own its own
components, hooks, and client-side logic, calling into `server/` for
business logic and `/api/v1/*` for the actual contract.
