# License Decision

> **Status: LICENSE DECISION PENDING.** No `LICENSE` file exists at the
> repository root yet. Do not add one without updating this document and
> getting explicit sign-off from the Bhoirwadi Sanskritik Association
> project owner — see `app.md #22` ("the license must be chosen explicitly
> before public release") and the top-level task brief's rule against
> silently choosing one.

## Options considered

| License | Type | Allows closed-source derivatives? | Patent grant? | Copyleft on network use (SaaS)? |
|---|---|---|---|---|
| **MIT** | Permissive | Yes | No | No |
| **Apache-2.0** | Permissive | Yes | Yes (explicit) | No |
| **AGPL-3.0** | Copyleft | No (must release source) | Yes | **Yes** — this is AGPL's distinguishing clause |

## Trade-offs for this project

- **MIT** — simplest, most familiar to contributors, maximizes adoption by
  other NGOs/temples/associations who might fork this for their own
  community. Offers no patent protection and no requirement that a
  hosted fork share its improvements back.
- **Apache-2.0** — same permissiveness as MIT plus an explicit patent
  grant (relevant if any future contributor or sponsor holds patents
  touching, e.g., video processing or livestream tech). Slightly longer/
  more formal license text. A common default for foundation-style,
  security-conscious infrastructure projects.
- **AGPL-3.0** — would guarantee that any organization running a modified
  hosted version of this platform must publish their modifications. This
  matters if the concern is a commercial SaaS company forking the project
  and never contributing back. The cost: it can deter well-intentioned
  adopters (some organizations have blanket policies against deploying
  AGPL software) and is a heavier legal lift for a community NGO project
  to maintain and explain to contributors.

## Recommendation (non-binding — owner must decide)

Given the stated goal of this release ("safe for public source release",
"contributor-friendly", intended for reuse by a community/NGO audience
rather than as a commercial product this org needs to defend against
SaaS competitors), **Apache-2.0** is the most common fit for this shape of
project: permissive enough for easy adoption and forking by other
community organizations, with an explicit patent grant that MIT lacks.
AGPL-3.0 is the right call only if preventing an unshared commercial fork
is a specific, deliberate goal.

## Decision log

| Date | Decision | Decided by |
|---|---|---|
| 2026-09-21 | No decision yet — flagged as pending per `app.md #22` | — |

Once decided: add the `LICENSE` file at the repo root, update
`package.json`'s `"license"` field, update `README.md`'s license section,
and record the decision (with date and decision-maker) in the table above.
