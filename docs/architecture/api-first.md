# API-First Architecture

`app.md #3.2`: the website, PWA, and future Android/iOS/kiosk clients are
all clients of `/api/v1`. No business rule should exist only inside a UI
component.

## Canonical response shape

Every endpoint returns (`lib/api/response.ts`):

```json
{ "data": {}, "error": null, "meta": { "request_id": "uuid", "api_version": "v1" } }
```

or on failure:

```json
{ "data": null, "error": { "code": "RESOURCE_NOT_FOUND", "message": "..." }, "meta": { "request_id": "uuid", "api_version": "v1" } }
```

`getRequestId(request)` reuses the caller's `x-request-id` header when
present (set by `middleware.ts` for every request) so client, API, and log
correlation share one ID.

## Error taxonomy

`BAD_REQUEST` (400) · `VALIDATION_ERROR` (422) · `UNAUTHENTICATED` (401) ·
`FORBIDDEN` (403) · `RESOURCE_NOT_FOUND` (404) · `CONFLICT` (409) ·
`RATE_LIMITED` (429) · `INTERNAL_ERROR` (500). Add new codes to
`ApiErrorCode` in `lib/api/response.ts` rather than inventing ad hoc strings
per route.

## What every endpoint must define (`app.md #6`)

See `docs/api/v1.md` for the worked example on the two endpoints that exist
today. Every new endpoint's PR should document, in that file:
authentication requirement, authorization requirement (which permission
key), Zod request/response schema, rate-limit class, audit requirement,
idempotency behavior, offline behavior, cache behavior, and expected error
codes — *before* merging, not as an afterthought.

## Versioning

Breaking changes require a new prefix (`/api/v2`) rather than mutating
`/api/v1`'s contract in place. Nothing in v0.0.1 needs this yet, but the
`API_VERSION` constant in `lib/api/response.ts` is the single place that
would change.
