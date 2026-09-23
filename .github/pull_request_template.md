## What does this PR do?

<!-- One or two sentences. -->

## Why?

<!-- Link an issue, or explain the motivation if there isn't one. -->

## Type of change

- [ ] `feat` — new feature
- [ ] `fix` — bug fix
- [ ] `security` — security-relevant change
- [ ] `docs` — documentation only
- [ ] `refactor` — no behavior change
- [ ] `chore` — tooling/CI/deps

## Checklist

- [ ] Complies with `docs/app.md` (or `docs/app.md` is updated in this PR, with reasoning, if it needed to change)
- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` all pass locally
- [ ] If this touches `supabase/migrations/` or RLS policies: `supabase test db` passes and `supabase/tests/` is updated
- [ ] If this adds/changes an API endpoint: `docs/api/v1.md` is updated with auth, authorization, schema, rate-limit class, audit, idempotency, offline, and cache behavior
- [ ] If this touches offline behavior: security-sensitive operations are NOT queueable offline (see `lib/offline/schemas.ts`'s `FORBIDDEN_OFFLINE_MUTATION_TYPES`)
- [ ] If this touches the service worker: no new caching of `/api/*`, secrets, or authenticated/user-specific responses
- [ ] `docs/context.md` is updated if this is an architecturally significant change
- [ ] No secrets, `.env` files, or credentials are included in this diff

## Security impact

<!-- "None" is a valid answer, but say so explicitly. -->

## Screenshots (if UI-facing)
