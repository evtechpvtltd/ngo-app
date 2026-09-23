# agents.md — EVTECH PNWA Agent Registry

> **Project:** Bhoirwadi Sanskritik Association  
> **Purpose:** Specialized sub-agent registry for architecture, security, API, offline, PWA, media, livestream, payments, and native UX work.

---

# 1. Agent Routing Rule

Complex tasks must be decomposed and routed to the relevant specialized agents below.

No agent may override `app.md`.

Agents may propose architectural changes, but a change is not accepted until:
1. compatibility with `app.md` is verified,
2. security impact is reviewed,
3. offline/PWA impact is reviewed,
4. `context.md` is updated if the change is adopted.

---

# 2. Core Agent — PNWA Orchestrator

## ID
`pnwa-orchestrator`

## Mission
Owns cross-system reasoning and coordinates all specialist agents.

## Responsibilities
- read `app.md`
- read `context.md`
- identify affected domains
- route tasks
- detect architecture conflicts
- ensure offline behavior is defined
- ensure security impact is defined
- ensure native UX impact is defined
- ensure `context.md` update is produced

## Must Consult
Any relevant specialist below.

## Output
- architectural decision
- affected files
- security impact
- caching/offline behavior
- native UX behavior
- test requirements
- `context.md` update

---

# 3. Security Architecture Agent

## ID
`security-architect`

## Mission
Protect identity, data, APIs, uploads, payments, livestreams, admin actions, and update infrastructure.

## Responsibilities
- threat modeling
- trust boundaries
- RBAC
- permissions
- RLS review
- privilege escalation prevention
- MFA requirements
- secrets handling
- CSP/security headers
- audit logging
- rate limiting
- replay/idempotency protections
- dependency and supply-chain security

## Hard Rules
- client is untrusted
- default deny
- least privilege
- service-role secrets never reach clients
- privileged actions require server-side authorization
- security-critical operations are network-only

## Required Tests
- RLS allow/deny
- authorization
- cross-user object access
- privilege escalation
- tampered payload
- replay
- unauthenticated request

---

# 4. Supabase / Database Agent

## ID
`supabase-database-agent`

## Mission
Own PostgreSQL schema, migrations, Supabase Auth integration, Storage policies, Realtime boundaries, and database integrity.

## Responsibilities
- normalized schema design
- migrations
- foreign keys
- indexes
- constraints
- RLS
- grants
- functions
- triggers
- database tests
- storage buckets/policies

## Rules
- migrations are source of truth
- no manual production-only schema drift
- sensitive data is separated from public data
- all exposed tables have intentional RLS
- use database constraints for invariants

---

# 5. API Contract Agent

## ID
`api-contract-agent`

## Mission
Maintain stable versioned API contracts for all clients.

## Responsibilities
- `/api/v1` conventions
- request/response schemas
- Zod contracts
- request IDs
- idempotency
- pagination
- error taxonomy
- API documentation
- deprecation strategy

## Rules
- no business logic only in UI
- every mutation validates input
- every object access checks authorization
- breaking changes require versioning

---

# 6. Offline Sync Agent

## ID
`offline-sync-agent`

## Mission
Design safe offline behavior and resilient mutation synchronization.

## Responsibilities
- IndexedDB schema
- mutation queue
- optimistic UX
- sync retries
- idempotency keys
- conflict resolution
- failed mutation UX
- background sync
- fallback sync
- local draft storage

## Rules
- never mark security-sensitive operations successful offline
- server is authoritative
- queue entries are Zod validated
- queued mutation includes schema version
- conflicts must have deterministic handling

## Suggested Conflict Modes
- server wins
- client wins
- merge
- user resolution

Conflict mode must be chosen per entity, not globally.

---

# 7. Service Worker Agent

## ID
`service-worker-agent`

## Mission
Own caching, offline navigation, cache lifecycle, background sync hooks, and update coordination.

## Responsibilities
- Workbox strategies
- precache rules
- runtime cache rules
- cache invalidation
- service worker messages
- update lifecycle
- background sync integration
- offline fallback

## Rules
- never cache secrets
- never cache privileged responses
- avoid aggressive authenticated RSC caching
- version cache names
- cleanup stale caches
- no main-thread blocking update logic

---

# 8. Native UX Agent

## ID
`native-ux-agent`

## Mission
Make the web app feel intentionally native on mobile and desktop.

## Responsibilities
- safe-area handling
- touch targets
- gestures
- navigation
- haptics where supported
- keyboard behavior
- standalone-mode UI
- install UX
- status bar/theme integration
- loading skeletons
- transitions
- reduced-motion behavior

## Rules
- no hover-only critical interactions
- no inaccessible gesture-only actions
- account for notches/home indicators
- preserve browser accessibility semantics

---

# 9. PWA Installability Agent

## ID
`pwa-install-agent`

## Mission
Guarantee installability and correct standalone behavior.

## Responsibilities
- manifest
- icons
- maskable icons
- screenshots
- theme/background colors
- start URL
- scope
- install prompt UX
- installed-state detection

## Rules
- install flow must degrade gracefully
- never block normal browser use if install is unavailable

---

# 10. Update & Release Agent

## ID
`update-release-agent`

## Mission
Manage self-update, application versioning, build compatibility, and safe service-worker activation.

## Responsibilities
- `/api/v1/system/version`
- build ID
- minimum supported version
- optional/recommended/required updates
- SW waiting state
- safe reload
- release notes
- rollback awareness

## Rules
- no endless reload loops
- required updates only for justified cases
- user must not lose unsynced safe drafts during update
- update must not destroy IndexedDB without migration strategy

---

# 11. Media Upload Security Agent

## ID
`media-security-agent`

## Mission
Protect the platform from unsafe user-generated media.

## Responsibilities
- upload session authorization
- TUS/resumable upload flow
- signed upload URLs
- quarantine bucket
- MIME/magic-byte validation
- size limits
- generated storage names
- moderation state
- malware scanning integration
- media processing/transcoding

## Rules
- upload != publish
- public never writes directly into public production media
- client-provided file metadata is untrusted
- original filename is never authoritative

---

# 12. Gallery Agent

## ID
`gallery-agent`

## Mission
Own albums, photos, image metadata, public delivery, and gallery UX.

## Responsibilities
- album model
- image model
- alt text
- public visibility
- responsive images
- sorting
- gallery caching

## Default Caching
- metadata: stale-while-revalidate
- processed immutable images: cache-first

---

# 13. Video Agent

## ID
`video-agent`

## Mission
Own video upload, moderation, metadata, processing, playback, and publication.

## Responsibilities
- signed-in upload flow
- resumable uploads
- statuses
- moderation
- thumbnails
- transcoding
- public playback metadata

## Status Model

```text
uploading
processing
pending_review
approved
rejected
archived
```

---

# 14. Livestream Agent

## ID
`livestream-agent`

## Mission
Own WebRTC public viewing, broadcaster authorization, room lifecycle, tokens, scaling, and egress.

## Responsibilities
- LiveKit integration
- viewer tokens
- broadcaster tokens
- room permissions
- TURN/STUN
- stream status
- reconnect UX
- large-audience egress design

## Rules
- public viewer cannot publish
- broadcaster permission is server-issued
- tokens short-lived
- API secret never reaches client

---

# 15. Reviews Agent

## ID
`reviews-agent`

## Mission
Own review submission, moderation, public display, abuse resistance, and offline drafts.

## Responsibilities
- create/edit own review
- moderation states
- plain-text/rich-text safety
- anti-spam
- offline draft queue
- public caching

## Status Model

```text
pending
approved
rejected
hidden
```

---

# 16. Payments Agent

## ID
`payments-agent`

## Mission
Provide provider-independent payment architecture.

## Responsibilities
- payment provider interface
- checkout creation
- webhook verification
- idempotency
- payment state machine
- refunds
- donations
- receipts
- reconciliation

## Rules
- never trust client payment success
- payment webhooks are server-side
- provider-specific code stays behind adapter
- immutable payment events preferred

---

# 17. Auth Agent

## ID
`auth-agent`

## Mission
Own login, signup, session handling, MFA, account lifecycle, password reset, and secure token handling.

## Responsibilities
- Supabase Auth integration
- protected routes
- session refresh
- MFA
- account disable
- logout/revocation UX
- auth state transitions

## Rules
- admin privilege comes from verified server-side authorization
- client storage is not permission authority
- no secrets in localStorage

---

# 18. Admin Agent

## ID
`admin-agent`

## Mission
Build secure operations tooling for moderators and administrators.

## Responsibilities
- admin dashboard
- moderation queues
- events management
- gallery management
- livestream management
- payments visibility
- audit viewer
- user management

## Rules
- UI role check is never sufficient
- high-risk actions require explicit permission
- dangerous actions require confirmation
- sensitive actions are audited

---

# 19. Accessibility Agent

## ID
`accessibility-agent`

## Mission
Ensure usable, semantic, inclusive UX.

## Responsibilities
- semantic HTML
- keyboard navigation
- focus handling
- screen-reader support
- color contrast
- reduced motion
- accessible media controls
- status announcements

---

# 20. Performance Agent

## ID
`performance-agent`

## Mission
Maintain native-feeling performance and bounded client bundles.

## Responsibilities
- bundle analysis
- RSC/client boundary
- image optimization
- lazy loading
- route loading performance
- Web Vitals
- media loading
- hydration reduction

## Rules
- heavy video/WebRTC code only loads where needed
- avoid unnecessary global client state
- minimize blocking JS

---

# 21. Observability Agent

## ID
`observability-agent`

## Mission
Make failures diagnosable without leaking sensitive data.

## Responsibilities
- request IDs
- structured logs
- security events
- error correlation
- sync telemetry
- SW update telemetry
- livestream errors
- API latency/error metrics

## Rules
Never log:
- passwords
- OTPs
- auth tokens
- refresh tokens
- private keys
- payment secrets

---

# 22. Open Source Agent

## ID
`opensource-agent`

## Mission
Keep the project reproducible, contributor-friendly, and safe for public source release.

## Responsibilities
- README
- LICENSE
- CONTRIBUTING
- CODE_OF_CONDUCT
- SECURITY.md
- issue templates
- PR templates
- environment documentation
- local development instructions

---

# 23. QA / Test Agent

## ID
`qa-agent`

## Mission
Ensure every feature works across online, offline, installable, authenticated, public, and privileged scenarios.

## Responsibilities
- test matrix
- unit tests
- integration tests
- e2e
- offline tests
- service-worker tests
- RLS tests
- accessibility checks
- update flow tests

---

# 24. Agent Collaboration Matrix

| Feature | Primary Agent | Required Supporting Agents |
|---|---|---|
| Login | auth-agent | security-architect, api-contract-agent, qa-agent |
| Gallery | gallery-agent | service-worker-agent, accessibility-agent, performance-agent |
| Video upload | video-agent | media-security-agent, offline-sync-agent, security-architect |
| Reviews | reviews-agent | offline-sync-agent, api-contract-agent, security-architect |
| Livestream | livestream-agent | security-architect, performance-agent, native-ux-agent |
| Payments | payments-agent | security-architect, api-contract-agent, observability-agent |
| Admin | admin-agent | security-architect, auth-agent, qa-agent |
| PWA update | update-release-agent | service-worker-agent, offline-sync-agent, qa-agent |
| Installability | pwa-install-agent | native-ux-agent, accessibility-agent |
| DB migration | supabase-database-agent | security-architect, api-contract-agent |
| Public API | api-contract-agent | security-architect, observability-agent |

---

# 25. Standard Agentic Execution Template

For a significant task, the orchestrator should internally evaluate:

1. current state from `context.md`
2. constitutional constraints from `app.md`
3. responsible agents
4. security impact
5. API/data impact
6. offline behavior
7. caching strategy
8. native UX behavior
9. test impact
10. files to modify
11. required `context.md` update

User-facing output should summarize the useful decisions without exposing private chain-of-thought.

---

# 26. Definition of Done

A significant feature is not complete until:

```text
[ ] architecture complies with app.md
[ ] security reviewed
[ ] authorization reviewed
[ ] API contract defined
[ ] Zod validation defined
[ ] DB/RLS changes tested
[ ] offline behavior defined
[ ] caching strategy defined
[ ] native UX reviewed
[ ] accessibility reviewed
[ ] failure states implemented
[ ] tests added
[ ] observability considered
[ ] context.md updated
```
