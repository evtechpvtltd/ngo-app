# app.md — Bhoirwadi Sanskritik Association PNWA Constitution

> **Status:** IMMUTABLE ARCHITECTURE CONSTITUTION  
> **Project:** Bhoirwadi Sanskritik Association  
> **Architecture:** Security-First · API-First · Offline-First · Open Source · Scalable PNWA  
> **Primary Client:** Progressive Native Web App (PNWA)  
> **Other Clients:** Android + iOS  
> **Owner Standard:** EVTECH PNWA Architecture

---

## 1. Core Directive

This file is the architectural constitution of the Bhoirwadi Sanskritik Association platform.

Every contributor, agent, feature implementation, database migration, API endpoint, UI flow, background sync task, and deployment decision MUST comply with this file.

If implementation code conflicts with `app.md`, **`app.md` wins**.

The platform SHALL be designed as:

1. **Security-first**
2. **API-first**
3. **Offline-first where safe**
4. **Progressive Native Web App first**
5. **Native-capable on Android and iOS**
6. **Open source**
7. **Horizontally scalable**
8. **Vendor-decoupled where practical**
9. **Accessible**
10. **Observable and auditable**

---

# 2. Immutable EVTECH Tech Stack

The following stack is mandatory unless this constitution is explicitly revised.

## Framework
- Next.js
- App Router
- React Server Components
- Server Actions only where appropriate and secure

## Backend
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions where privileged backend execution is required

## UI
- shadcn/ui
- Radix primitives
- Tailwind CSS
- Lucide React

## Validation
- Zod for:
  - API payloads
  - forms
  - environment variables
  - offline mutation payloads
  - webhook input
  - service-worker messages
  - version/update metadata

## PWA
- App Router-compatible PWA layer
- Custom Service Worker where necessary
- Workbox strategies
- Web App Manifest
- IndexedDB
- Background Sync when available
- Safe fallback sync when Background Sync is unavailable

## Livestream
- WebRTC
- LiveKit self-hosted preferred for production architecture
- TURN/STUN
- HLS/CDN egress may be added for high-scale public broadcasts

---

# 3. Non-Negotiable Architectural Principles

## 3.1 Never Trust the Client

The following are always untrusted:

- Browser
- Installed PWA
- Android client
- iOS client
- Service worker
- IndexedDB
- Local storage
- URL parameters
- form fields
- uploaded files
- JWT data until verified
- payment redirects
- livestream join requests
- client-computed permissions
- cached API responses
- offline mutation queues

No sensitive action may be authorized solely by client-side state.

---

## 3.2 API Is the Product

The website, PWA, Android app, iOS app, future kiosk apps, admin tools, integrations, and bots are clients of the platform API.

Canonical API prefix:

```text
/api/v1
```

No business rule may exist only in a UI component.

Every important capability must eventually be expressible through a stable API contract.

---

## 3.3 Offline-First Does Not Mean Offline-Trusted

Safe user actions may be queued offline.

Security-sensitive actions must NOT be treated as successful until the server verifies them.

### Safe to queue offline
- review drafts
- profile draft edits
- feedback drafts
- non-sensitive content drafts
- upload metadata preparation
- local event bookmarks
- local UI preferences

### Must require server confirmation
- login/session creation
- password reset completion
- MFA enrollment
- role changes
- permission changes
- admin actions
- moderation approval/rejection
- payment confirmation
- refunds
- donation settlement
- livestream broadcaster authorization
- livestream start/end authority
- user bans/suspensions
- destructive operations
- security settings

Queued mutations MUST remain in a `pending` state until acknowledged by the server.

---

# 4. Repository Structure

Recommended canonical structure:

```text
bhoirwadi-sanskritik-association/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (member)/
│   ├── admin/
│   ├── api/
│   │   └── v1/
│   └── manifest.ts
│
├── components/
│   ├── ui/
│   ├── shell/
│   ├── media/
│   ├── forms/
│   └── native/
│
├── features/
│   ├── auth/
│   ├── profiles/
│   ├── gallery/
│   ├── videos/
│   ├── reviews/
│   ├── livestreams/
│   ├── events/
│   ├── payments/
│   ├── notifications/
│   └── admin/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── validation/
│   ├── permissions/
│   ├── offline/
│   ├── pwa/
│   ├── security/
│   ├── storage/
│   ├── logging/
│   └── supabase/
│
├── server/
│   ├── services/
│   ├── repositories/
│   ├── policies/
│   └── jobs/
│
├── service-worker/
│   ├── sw.ts
│   ├── strategies/
│   ├── sync/
│   ├── updates/
│   └── messages/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── seed/
│   └── tests/
│
├── docs/
│   ├── app.md
│   ├── agents.md
│   ├── context.md
│   ├── security.md
│   ├── threat-model.md
│   ├── api/
│   └── architecture/
│
├── public/
│   ├── icons/
│   └── screenshots/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── security/
│   └── rls/
│
├── .github/
│   └── workflows/
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
└── .env.example
```

---

# 5. Routing Constitution

## Public Routes

Examples:

```text
/
/about
/events
/events/[slug]
/gallery
/gallery/[album]
/videos
/videos/[id]
/reviews
/live
/live/[id]
/donate
/contact
```

Public routes may use aggressive caching only when content is truly public and not user-specific.

---

## Authenticated Routes

Examples:

```text
/account
/profile
/my-reviews
/my-videos
/upload/video
/settings
```

Authenticated route payloads MUST NOT be indiscriminately cached by the service worker.

---

## Privileged Routes

Examples:

```text
/admin
/admin/users
/admin/media
/admin/videos
/admin/reviews
/admin/events
/admin/livestreams
/admin/payments
/admin/audit
/admin/system
```

UI protection is convenience only.

Every privileged operation MUST also be enforced by:

1. API authorization
2. server-side permission checks
3. PostgreSQL RLS/grants where applicable

---

# 6. API Contract Constitution

Canonical response:

```json
{
  "data": {},
  "error": null,
  "meta": {
    "request_id": "uuid",
    "api_version": "v1"
  }
}
```

Canonical error:

```json
{
  "data": null,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  },
  "meta": {
    "request_id": "uuid",
    "api_version": "v1"
  }
}
```

## API Requirements

Every API endpoint MUST define:

- authentication requirement
- authorization requirement
- Zod request schema
- Zod response schema where practical
- rate-limit class
- audit requirements
- idempotency behavior
- offline behavior
- cache behavior
- expected error codes

---

# 7. Authentication & Authorization

## Roles

Initial roles:

```text
member
moderator
content_manager
event_manager
finance_manager
admin
super_admin
```

Anonymous is a request state, not a stored privileged role.

## Permissions

Authorization SHOULD be permission-based.

Examples:

```text
gallery.read
gallery.create
gallery.update
gallery.delete

video.read
video.upload
video.update_own
video.delete_own
video.moderate

review.read
review.create
review.update_own
review.delete_own
review.moderate

event.read
event.create
event.update
event.publish
event.delete

livestream.read
livestream.create
livestream.broadcast
livestream.end
livestream.manage

payment.create
payment.read_own
payment.read_all
payment.refund

user.read
user.manage
role.assign
system.manage
audit.read
```

## Super Admin Rules

- super_admin MUST NOT be assignable by normal admins
- high-risk actions MUST require re-authentication
- MFA MUST be mandatory for super_admin
- security-relevant changes MUST create audit events
- system secrets MUST never be exposed to any client

---

# 8. Database Constitution

## Core Domains

```text
identity
profiles
roles
permissions
user_roles
role_permissions

content
pages
announcements

media
gallery_albums
gallery_photos
videos
video_reports

community
reviews
review_votes

events
events
event_registrations

live
livestreams
livestream_sessions

finance
payments
payment_attempts
payment_events
refunds
donations
receipts

system
app_versions
feature_flags
notifications
audit_logs
security_events
system_settings
```

Actual schema layout may use PostgreSQL schemas such as:

```text
public
private
audit
```

Sensitive or internal tables SHOULD live outside directly exposed schemas when practical.

---

# 9. RLS Constitution

Any table exposed through Supabase APIs MUST explicitly define RLS policies.

Default posture:

```text
DENY
```

Access is granted intentionally.

Rules:

- authenticated users cannot mutate roles directly
- members can only modify owned resources where allowed
- public can only read explicitly public, approved resources
- moderation status cannot be client-controlled
- finance records must be tightly restricted
- audit logs must not be deletable by ordinary admins
- service role / secret key MUST never appear in frontend code
- all RLS policies require automated allow/deny tests

---

# 10. Media Security Constitution

## Public Photo Gallery

- public may read approved processed media
- raw/master media may remain private
- uploads require authorized users
- metadata is validated
- storage bucket listing is not automatically public
- public URLs must expose only intended assets

## User Video Uploads

Signed-in users may upload video, but upload does NOT imply publication.

Required flow:

```text
authenticated user
→ request upload session
→ validation
→ signed/resumable upload
→ quarantine/private storage
→ file inspection
→ malware/AV scan when supported
→ media validation
→ transcoding/processing
→ moderation
→ approval
→ public publication
```

Never trust:
- extension
- filename
- MIME header
- codec declaration
- duration
- dimensions
- metadata

Server generates canonical storage identifiers.

---

# 11. Livestream Constitution

Public viewing does NOT mean open publishing.

## Viewer Token

Public viewer token MAY allow:

```text
roomJoin = true
canSubscribe = true
canPublish = false
canPublishData = false
```

## Broadcaster Token

Requires:
- authenticated user
- livestream.broadcast permission
- valid active livestream
- short-lived server-issued token

LiveKit secrets MUST exist only in trusted backend environments.

For high-scale broadcasts, architecture may extend to:

```text
WebRTC publisher
→ LiveKit SFU
→ egress
→ HLS
→ CDN
→ large public audience
```

---

# 12. Payment Constitution

Provider is intentionally abstracted.

Required interface concept:

```ts
interface PaymentProvider {
  createPayment(input: unknown): Promise<unknown>
  getPayment(id: string): Promise<unknown>
  refundPayment(input: unknown): Promise<unknown>
  verifyWebhook(input: unknown): Promise<unknown>
}
```

Possible providers may include Razorpay, Cashfree, Stripe, or another approved provider.

Payment state MUST never be finalized based on:
- client redirect
- query string
- client JSON
- frontend callback alone

Final payment state MUST be derived from verified server-side provider communication.

Webhook handlers MUST be:
- signature verified
- idempotent
- replay resistant
- audited

---

# 13. PWA Caching Constitution

## Static Assets

Strategy:

```text
Cache First
```

Applies to:
- immutable JS/CSS chunks
- icons
- fonts where permitted
- versioned static assets

---

## Public Content

Default:

```text
Stale While Revalidate
```

Examples:
- gallery listing
- public announcements
- public event pages
- public reviews
- public informational pages

Exceptions may use Network First where freshness is more important.

---

## Freshness-Sensitive Public Data

Default:

```text
Network First with bounded fallback
```

Examples:
- current livestream state
- active event availability
- urgent announcement status

---

## Authenticated/User-Specific RSC

Do NOT aggressively cache.

Authenticated RSC payloads must be treated as sensitive and user-specific.

Where offline support is necessary, store intentionally designed local projections rather than blindly caching RSC/network responses.

---

## Security-Critical Endpoints

Strategy:

```text
Network Only
```

Examples:
- authentication
- MFA
- permissions
- admin actions
- payment confirmation
- refunds
- role changes
- livestream broadcaster tokens
- security settings

---

# 14. Offline Mutation Queue

IndexedDB is the canonical offline mutation queue.

Each queued mutation SHOULD include:

```text
id
type
schema_version
user_id
created_at
payload
idempotency_key
retry_count
last_error
status
```

Statuses:

```text
pending
syncing
succeeded
failed
requires_user_action
```

Every queued mutation MUST be validated with Zod:
- before local persistence
- before sync
- again on the server

The server remains authoritative.

---

# 15. Service Worker Lifecycle

The service worker MUST:

- avoid blocking the main thread
- use versioned caches
- clean stale caches safely
- not cache secrets
- not cache privileged API responses
- not cache dynamic authenticated RSC indiscriminately
- coordinate update state with the client
- expose predictable update messages
- support graceful activation

Update flow:

```text
new SW detected
→ install
→ waiting
→ notify app
→ user sees update UI
→ activate safely
→ reload once
```

Forced updates may be used only when necessary for security or compatibility.

---

# 16. Self-Update / Version Contract

Canonical version endpoint:

```text
GET /api/v1/system/version
```

Example:

```json
{
  "data": {
    "version": "0.1.0",
    "build_id": "2026.09.21.1",
    "minimum_supported_version": "0.1.0",
    "update_type": "optional"
  },
  "error": null
}
```

`update_type`:

```text
none
optional
recommended
required
```

Required updates must be reserved for:
- security fixes
- incompatible data model changes
- unsupported client versions
- critical stability issues

---

# 17. Native UX Constitution

The PNWA must feel intentionally native.

Required:

- `viewport-fit=cover`
- safe-area support using `env(safe-area-inset-*)`
- minimum touch target sizing
- keyboard-aware layouts
- mobile navigation patterns
- skeleton/loading states
- offline indicators
- sync state indicators
- install state handling
- reduced-motion support
- accessible focus states
- smooth route transitions where practical
- native share API where supported
- haptic feedback only where available and appropriate
- no accidental double-tap actions
- no desktop-only hover dependency

`overscroll-behavior: none` may be used where preventing browser bounce/pull-to-refresh improves the app experience without harming accessibility.

---

# 18. Manifest Constitution

Manifest MUST define:

- name
- short_name
- start_url
- scope
- display: standalone
- theme_color
- background_color
- orientation as intentionally chosen
- maskable icons
- standard icons
- screenshots where appropriate
- categories where applicable

Icons MUST include production-grade sizes.

---

# 19. Security Headers

Web responses SHOULD implement appropriately configured:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
frame-ancestors
```

Security headers must be tested against:
- authentication
- Supabase connectivity
- LiveKit/WebRTC
- media
- image loading
- PWA install
- service worker operation

---

# 20. Secrets Constitution

Never commit:

```text
.env
.env.local
.env.production
private keys
database credentials
Supabase secret/service keys
payment secrets
LiveKit API secrets
SMTP credentials
OTA signing private keys
production JWT secrets
```

Only `.env.example` belongs in source control.

Environments:

```text
development
staging
production
```

Credentials MUST be isolated between environments.

---

# 21. Audit & Security Logging

Sensitive operations MUST be auditable.

Audit events should capture where lawful and appropriate:

```text
event_id
request_id
actor_id
action
resource_type
resource_id
result
timestamp
source_ip_hash_or_safe_representation
user_agent_summary
metadata
```

Never log:
- passwords
- OTPs
- refresh tokens
- raw access tokens
- payment secrets
- private signing keys
- LiveKit API secret

---

# 22. Open Source Constitution

Repository MUST include:

```text
README.md
LICENSE
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
CHANGELOG.md
.env.example
```

The license must be chosen explicitly before public release.

Security-sensitive infrastructure configuration may be open source, but credentials never are.

---

# 23. Testing Constitution

Required categories:

```text
unit
integration
e2e
API
RLS
authorization
offline sync
service worker
update flow
upload security
payment webhook
livestream token permissions
```

CI SHOULD include:

```text
typecheck
lint
tests
RLS tests
secret scanning
dependency scanning
build verification
```

---

# 24. Observability

Critical flows must emit structured events.

Observe:

- auth failures
- permission denials
- upload failures
- moderation actions
- payment webhook failures
- offline sync failures
- service worker update failures
- livestream token failures
- livestream state
- database errors
- edge-function errors

Request IDs should correlate client/API/server logs.

---

# 25. Performance Constitution

Performance is a product requirement.

Targets should be tracked in `context.md`.

Rules:
- avoid unnecessary client components
- prefer RSC for public/server-rendered content
- lazy-load heavy media tools
- never ship LiveKit/video tooling on routes that do not need it
- optimize images
- use responsive media
- keep JS bundles bounded
- virtualize large lists when needed
- avoid blocking main-thread service-worker coordination

---

# 26. Accessibility

Minimum target:
- WCAG 2.2 AA where practical

Required:
- semantic HTML
- keyboard navigation
- focus management
- alt text
- labels
- reduced-motion support
- sufficient contrast
- accessible dialogs
- screen-reader-friendly status updates for offline/sync/update states

---

# 27. Initial Feature Scope

Current planned features:

```text
Public gallery
User-uploadable videos for signed-in users
Public video viewing after moderation
Public livestream
Reviews
Events
Authentication
Member profile
Admin/moderation tools
Payments/donations — provider undecided
PWA installation
Self-update flow
Offline-safe behavior
```

---

# 28. Build Order

## Phase 0 — Security Foundation
- threat model
- trust boundaries
- RBAC/permission matrix
- RLS design
- MFA strategy
- secrets architecture
- rate limits
- audit model
- upload quarantine design
- payment security contract
- livestream token security
- offline-sync threat model
- service-worker/update security

## Phase 1 — Platform Foundation
- repo setup
- environment validation
- Supabase clients
- auth
- schema
- API conventions
- permission engine
- app shell
- manifest
- service worker
- IndexedDB
- version/update channel

## Phase 2 — Public Experience
- home
- about
- events
- gallery
- reviews read
- livestream public viewer

## Phase 3 — Member Experience
- sign in
- profile
- reviews submission
- video uploads
- upload progress
- offline-safe drafts

## Phase 4 — Moderation/Admin
- moderation queue
- gallery management
- video approval
- review moderation
- event management
- audit viewer
- system health

## Phase 5 — Payments
- provider adapter
- donations
- receipts
- webhook verification
- reconciliation

## Phase 6 — Native Packaging / Expansion
- Android
- iOS
- deep links
- push notifications
- platform-specific capabilities

---

# 29. Architecture Change Protocol

Changing any of the following requires updating this file first:

- framework
- backend
- auth provider
- database
- service-worker strategy
- API versioning approach
- role model
- offline sync architecture
- payment abstraction
- livestream architecture
- security model

Significant changes must also be recorded in `context.md`.

---

# 30. Final Rule

When uncertain, optimize in this order:

```text
Security
→ Data integrity
→ User privacy
→ Correctness
→ Offline resilience
→ Accessibility
→ Native UX
→ Performance
→ Developer convenience
```
