# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.0.x (current) | Yes — this is the only released line |

There is no long-term support policy yet; this will be formalized once a
1.0 release exists.

## Reporting a vulnerability

**Please do not open a public GitHub issue for a security vulnerability.**
Public disclosure before a fix is available puts every deployed instance
of this platform at risk.

Instead, email **ceo@evtech.org.in** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept code/requests are welcome)
- The affected version/commit
- Your assessment of severity, if you have one

You should receive an acknowledgment within a reasonable timeframe. We
will work with you to understand and validate the issue, develop a fix,
and coordinate disclosure timing before any public writeup.

> **Interim contact notice:** this repository does not yet have a
> dedicated security-reporting address or a published PGP key. The email
> above is the project owner's direct contact and is usable today, but a
> dedicated `security@` alias (and ideally a `security.txt` /
> GitHub Security Advisories setup) should be configured before this
> project is promoted for wider public use. Track this under
> `docs/context.md`'s open-source blockers.

## What's in scope

The application code in this repository: the Next.js app, API routes,
Supabase migrations/RLS policies, the service worker, and the offline
mutation queue. Vulnerabilities in third-party dependencies should
generally be reported upstream, but please also let us know so we can
track and patch our usage.

## What's out of scope for v0.0.1

Because this release has no domain features yet (no gallery, video
uploads, reviews, events, livestream, or payments), reports about those
systems don't apply — there's nothing there to attack yet. Reports about
missing rate limiting on `/api/v1/health` or `/api/v1/system/version`
(both public, read-only, unauthenticated by design) are acknowledged but
low priority until real write endpoints exist.
