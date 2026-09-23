# Contributing

Thanks for considering a contribution to the Bhoirwadi Sanskritik
Association platform. This is a `v0.0.1` foundation release — most
community-facing features don't exist yet, so a lot of the highest-value
contributions right now are architectural: RLS tests, CI hardening, and
the next domain feature (see [`docs/context.md`](./docs/context.md) for
what's next).

## Before you start

1. Read [`docs/app.md`](./docs/app.md) — the architecture constitution.
   Any change that conflicts with it needs `app.md` updated first, in the
   same PR, with the reasoning.
2. Read [`docs/agents.md`](./docs/agents.md) to understand which concern
   (security, offline sync, RBAC, PWA, ...) your change touches, and what
   its rules and required tests are.
3. Check [`docs/context.md`](./docs/context.md) for current state and
   near-term priorities before starting non-trivial work, to avoid
   duplicate effort.

## Workflow

1. **Fork** the repository.
2. **Branch** off `main` using a conventional prefix:
   - `feat/<short-description>`
   - `fix/<short-description>`
   - `security/<short-description>`
   - `docs/<short-description>`
   - `refactor/<short-description>`
   - `chore/<short-description>`
3. **Develop.** Run locally with `npm run dev` (see `README.md` for
   Supabase setup). Keep changes scoped — a bug fix doesn't need
   accompanying refactors.
4. **Test.** At minimum:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```
   If your change touches `supabase/migrations/` or RLS policies, also run
   `supabase test db` and update/add pgTAP tests under `supabase/tests/`.
5. **Commit** using clear, imperative messages (`Add gallery RLS policy`,
   not `updates`). Reference the relevant `agents.md` specialist if it
   clarifies intent (e.g. `security-architect: tighten audit_logs policy`).
6. **Push** and open a **Pull Request** against `main` using
   `.github/pull_request_template.md`.
7. **Review.** CI (`.github/workflows/ci.yml`) must pass:
   install → typecheck → lint → test → build → `npm audit`. A maintainer
   reviews for architectural compliance with `app.md` in addition to
   correctness.
8. **Merge.** Squash or rebase merges preferred to keep history readable.

## Definition of done

Before requesting review, walk through `agents.md #26` ("Definition of
Done") for anything beyond a trivial fix: security reviewed, authorization
reviewed, API contract defined (`docs/api/v1.md` updated for new
endpoints), Zod validation defined, RLS changes tested, offline behavior
defined, caching strategy defined, native UX reviewed, accessibility
reviewed, failure states implemented, tests added, `docs/context.md`
updated.

## Code style

- TypeScript, strict mode. No `any` without a comment explaining why it's
  unavoidable.
- No comments explaining *what* code does — name things well instead.
  Comments are for non-obvious *why* (a security constraint, a workaround,
  an invariant).
- Don't add abstractions, config flags, or error handling for scenarios
  that can't currently happen.
- `lib/supabase/admin.ts` (the service-role client) is never imported from
  UI code — see `docs/security.md #2` for why, and let ESLint catch it.

## Security-sensitive changes

Anything touching authentication, RBAC, RLS policies, the service-role
client, the service worker's caching rules, or the offline mutation queue's
forbidden-type list should be flagged as `security/*` and reviewed with
extra scrutiny. See [`SECURITY.md`](./SECURITY.md) for reporting an actual
vulnerability rather than proposing a fix in a public PR.
