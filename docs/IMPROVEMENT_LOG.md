# Continuous Improvement Log

## 2026-06-26 Cycle 1

Baseline: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, and `npm run build` pass.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Harden `POST /api/trips` request validation | High | High | High | Medium | High | High | Low | Low | Selected |
| 2 | Guard `POST /api/trips/[id]/activities` JSON parsing/manual numeric fields | High | High | High | Medium | Medium | High | Medium | Medium | Next candidate |
| 3 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |
| 4 | Silence expected `console.error` noise in tests | Low | Low | Medium | Medium | Medium | High | Low | Low | Later |

Completed: `POST /api/trips` now rejects invalid JSON/body/name/cities before Prisma and trims valid input. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_trip-post-validation-plan.md`.

## 2026-06-26 Cycle 2

Baseline: working tree clean on `improve/trip-post-validation`; Cycle 1 pushed to branch because direct `main` push is blocked by required PR rules.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Prevent activity create API from treating null coordinates as `(0, 0)` | High | High | High | Medium | High | High | Low | Low | Selected |
| 2 | Guard `POST /api/trips/[id]/activities` invalid JSON/non-object bodies | High | High | High | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Validate manual activity `type`, `suggestedTime`, and `durationMinutes` | Medium | High | Medium | Medium | Medium | High | Medium | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: manual activity creation now geocodes when form coordinates are null/blank, rejects partial/non-finite manual coordinates, and rejects Google-place payloads without finite coordinates. Verification passed: targeted red/green Jest with `--runTestsByPath`, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-coordinate-validation-plan.md`.

## 2026-06-26 Cycle 3

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; no active plan files remain in `docs/plans/`.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Guard `POST /api/trips/[id]/activities` invalid JSON/non-object bodies | High | High | High | Medium | High | High | Low | Low | Selected |
| 2 | Validate manual activity `type`, `suggestedTime`, and `durationMinutes` | Medium | High | Medium | Medium | Medium | High | Medium | Low | Next candidate |
| 3 | Guard `POST /api/trips/[id]/activities/fill` invalid JSON/non-object bodies | Medium | High | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: `POST /api/trips/[id]/activities` now rejects invalid JSON and non-object bodies with 400 before trip lookup. Verification passed: targeted red/green Jest with `--runTestsByPath`, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-post-body-validation-plan.md`.

## 2026-06-26 Cycle 4

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; activity create body parsing is now guarded.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Validate manual activity `type`, `suggestedTime`, and `durationMinutes` | Medium | High | Medium | Medium | High | High | Low | Low | Selected |
| 2 | Guard `POST /api/trips/[id]/activities/fill` invalid JSON/non-object bodies | Medium | High | Medium | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Guard itinerary update JSON parsing | Medium | High | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: manual activity creation now rejects unsupported `type`, invalid `suggestedTime`, and non-positive/non-integer `durationMinutes` before writing. Verification passed: targeted red/green Jest with `--runTestsByPath`, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_manual-activity-field-validation-plan.md`.

## 2026-06-26 Cycle 5

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; manual activity field validation is in place.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Guard `POST /api/trips/[id]/activities/fill` invalid JSON/non-object bodies | Medium | High | Medium | Medium | High | High | Low | Low | Selected |
| 2 | Guard itinerary update JSON parsing | Medium | High | Medium | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Guard auth JSON parsing for login/register/change-password | High | High | High | Medium | Medium | High | Medium | Medium | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: `POST /api/trips/[id]/activities/fill` now rejects invalid JSON and non-object bodies with 400 before trip lookup, LLM fill, or geocoding. Verification passed: targeted red/green Jest with `--runTestsByPath`, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-fill-body-validation-plan.md`.

## 2026-06-26 Cycle 6

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; activity fill body parsing is now guarded.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Guard itinerary PATCH malformed JSON | Medium | High | Medium | Medium | High | High | Low | Low | Selected |
| 2 | Guard auth JSON parsing for login/register/change-password | High | High | High | Medium | Medium | High | Medium | Medium | Next candidate |
| 3 | Guard user preference JSON parsing | Medium | High | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: `PATCH /api/trips/[id]/itinerary` now rejects malformed JSON with 400 before itinerary lookup while preserving existing array/item validation. Verification passed: targeted red/green Jest with `--runTestsByPath`, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_itinerary-patch-json-validation-plan.md`.

## 2026-06-26 Cycle 7

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; itinerary PATCH malformed JSON is now guarded.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Guard auth JSON parsing for register/login/change-password | High | High | High | Medium | High | High | Medium | Low | Selected |
| 2 | Guard user preference JSON parsing | Medium | High | Medium | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Guard user admin preference JSON parsing | Medium | High | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: auth register/login/change-password now reject malformed or non-object JSON bodies with 400 before user database work while preserving valid auth flows. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_auth-json-body-validation-plan.md`.

## 2026-06-26 Cycle 8

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; auth JSON body parsing is now guarded.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Guard `/api/me/preferences` POST/PUT malformed JSON | Medium | High | Medium | Medium | High | High | Low | Low | Selected |
| 2 | Validate preference likes/dislikes array shapes | Medium | Medium | Medium | Medium | Medium | High | Medium | Low | Next candidate |
| 3 | Guard remaining trip share/public-link JSON parsing | Medium | High | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: `/api/me/preferences` POST and PUT now reject malformed or non-object JSON with 400 before preference database work while preserving valid create/update behavior. Verification passed after one build-type fix: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_me-preferences-json-validation-plan.md`.

## 2026-06-26 Cycle 9

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; current-user preferences JSON parsing is now guarded.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Guard trip share malformed JSON before user lookup/upsert | High | High | High | Medium | High | High | Low | Low | Selected |
| 2 | Validate preference likes/dislikes array shapes | Medium | Medium | Medium | Medium | Medium | High | Medium | Low | Next candidate |
| 3 | Guard public-link/share-token mutation inputs | Medium | High | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: `POST /api/trips/[id]/share` now rejects malformed or non-object JSON with 400 before user lookup or membership upsert while preserving valid share behavior. Verification passed: targeted red/green Jest with `--runTestsByPath`, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_trip-share-json-validation-plan.md`.

## 2026-06-26 Cycle 10

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; trip share JSON parsing is now guarded.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Validate preference `likes`/`dislikes` array shapes | Medium | High | Medium | Medium | High | High | Low | Low | Selected |
| 2 | Guard public-link/share-token mutation inputs | Medium | High | Medium | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Validate preference budget/language enumerations | Low | Medium | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: `/api/me/preferences` now trims valid `likes`/`dislikes`, drops blanks, and rejects non-array or non-string list entries before preference database writes. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_preference-array-validation-plan.md`.

## 2026-06-26 Cycle 11

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; preference arrays are now validated.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Wrap trip deletion child cleanup and final delete in a transaction | High | High | High | Medium | High | High | Low | Low | Selected |
| 2 | Guard public-link/share-token mutation edge cases | Medium | High | Medium | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Validate preference budget/language enumerations | Low | Medium | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: `DELETE /api/trips/[id]` now deletes itinerary items, activities, members, and the trip inside one Prisma transaction to avoid partial cleanup. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_trip-delete-transaction-plan.md`.

## 2026-06-26 Cycle 12

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; `npm audit --omit=dev --json` reports high transitive vulnerabilities in `hono` and `ws`.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Patch production audit vulnerabilities in transitive `hono` and `ws` using existing overrides | High | Medium | High | Medium | High | High | Low | Low | Selected |
| 2 | Guard public-link/share-token mutation edge cases | Medium | High | Medium | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Validate preference budget/language enumerations | Low | Medium | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Later |

Completed: production audit vulnerabilities in transitive `hono` and `ws` were cleared by raising existing overrides and refreshing the lockfile. Verification passed: `npm audit --omit=dev`, `npm ls hono ws`, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_prod-audit-overrides-plan.md`.

## 2026-06-26 Cycle 13

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; production audit is clean, while full dev audit still reports Jest-chain moderate issues whose suggested fix is a risky downgrade.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Validate preference `budget` and `preferredLanguage` server-side | Medium | High | Medium | Medium | High | High | Low | Low | Selected |
| 2 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |
| 3 | Guard public-link idempotency/unnecessary writes | Low | Medium | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Replace deprecated `next lint` script before Next 16 | Medium | Low | Medium | High | Medium | High | Medium | Low | Next candidate |

Completed: `/api/me/preferences` now normalizes blank `budget`/`preferredLanguage` to null and rejects unsupported or non-string values before database writes while preserving existing valid values. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_preference-enum-validation-plan.md`.

## 2026-06-26 Cycle 14

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; lint currently passes but prints the `next lint` deprecation warning.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Replace deprecated `next lint` script before Next 16 removal | Medium | Low | Medium | High | High | High | Low | Low | Selected |
| 2 | Guard public-link idempotency/unnecessary writes | Low | Medium | Low | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |
| 4 | Add tests to suppress expected console error noise | Low | Low | Medium | Medium | Medium | High | Low | Low | Later |

Completed: `npm run lint` now uses the ESLint CLI instead of deprecated `next lint`, removing the Next 16 deprecation warning while preserving lint coverage for `src` and `e2e`. Verification passed: red script check, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_eslint-cli-script-plan.md`.

## 2026-06-26 Cycle 15

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; production audit is clean but not enforced by CI or local `just ci`.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Add `npm audit --omit=dev` gate to CI and local `just ci` | High | Medium | High | Medium | High | High | Low | Low | Selected |
| 2 | Guard public-link idempotency/unnecessary writes | Low | Medium | Low | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |
| 4 | Suppress expected console error noise in tests | Low | Low | Medium | Medium | Medium | High | Low | Low | Later |

Completed: GitHub Actions CI and local `just ci` now run `npm audit --omit=dev` after install, with Jest coverage guarding the workflow step. Verification passed: targeted red/green Jest, production audit, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_ci-prod-audit-plan.md`.

## 2026-06-26 Cycle 16

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; full Jest passes but expected `console.error` blocks obscure verification output.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Suppress expected console error noise in targeted error-path tests | Low | Low | Medium | High | Medium | High | Low | Low | Selected |
| 2 | Guard public-link idempotency/unnecessary writes | Low | Medium | Low | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |
| 4 | Add local `just audit-prod` docs to README | Low | Low | Low | Medium | Low | High | Low | Low | Later |

Completed: expected error logs in itinerary and geocoding tests are now locally spied/asserted, removing `console.error` blocks from full Jest output without changing production logging. Verification passed: targeted red/green noise grep, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_expected-console-noise-plan.md`.

## 2026-06-26 Cycle 17

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; `DELETE /api/activities/[id]` performs two related writes outside a transaction.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Wrap activity delete child-row cleanup and activity delete in one transaction | Medium | Medium | High | Medium | Medium | High | Low | Low | Selected |
| 2 | Guard public-link idempotency/unnecessary writes | Low | Medium | Low | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Validate `PATCH /api/activities/[id]` empty update bodies | Low | Medium | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: `DELETE /api/activities/[id]` now deletes itinerary references and the activity inside one Prisma transaction, preserving the 204 response. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-delete-transaction-plan.md`.

## 2026-06-26 Cycle 18

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; `PATCH /api/activities/[id]` accepts `{}` and reaches a no-op Prisma update.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Reject empty activity PATCH bodies before DB update | Medium | High | Medium | Medium | Medium | High | Low | Low | Selected |
| 2 | Guard public-link idempotency/unnecessary writes | Low | Medium | Low | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Reject empty trip PATCH bodies before DB update | Low | Medium | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: `PATCH /api/activities/[id]` now rejects empty update bodies before reaching Prisma, while non-empty patch coverage remains intact. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-patch-empty-body-plan.md`.

## 2026-06-26 Cycle 19

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; `PATCH /api/trips/[id]` accepts `{}` and reaches a no-op Prisma update.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Reject empty trip PATCH bodies before DB update | Medium | High | Medium | Medium | Medium | High | Low | Low | Selected |
| 2 | Guard public-link idempotency/unnecessary writes | Low | Medium | Low | Medium | Medium | High | Low | Low | Next candidate |
| 3 | Validate activity PATCH unknown-field-only bodies explicitly | Low | Medium | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: `PATCH /api/trips/[id]` now rejects empty update bodies before reaching Prisma, while valid updates and schedule clearing remain covered. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_trip-patch-empty-body-plan.md`.

## 2026-06-26 Cycle 20

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; public-link enablement rewrites an already-present share token.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Make public-link POST idempotent by skipping redundant update | Low | Medium | Medium | Medium | Medium | High | Low | Low | Selected |
| 2 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |
| 3 | Add stronger public-link token persistence assertions | Low | Medium | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: `POST /api/trips/[id]/public-link` now returns an existing share token without rewriting the trip, while missing-token creation still persists a new token. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_public-link-idempotent-plan.md`.

## 2026-06-26 Cycle 21

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; GitHub Actions CI generates Prisma client but local `just ci` does not.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Add `db-generate` to local `just ci` to match workflow CI | Medium | Medium | High | High | High | High | Low | Low | Selected |
| 2 | Reset public-link Jest mock implementations between tests | Low | Low | Medium | Medium | Medium | High | Low | Low | Later |
| 3 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: local `just ci` now runs `db-generate` after install/audit, matching GitHub Actions' Prisma generation step before lint/test/build. Verification passed: targeted red/green Jest, `just --dry-run ci`, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_just-ci-prisma-generate-plan.md`.

## 2026-06-26 Cycle 22

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; auth routes validate raw email strings but persist/look up trimmed lowercase emails.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Normalize auth emails before validation in register/login | Medium | High | Medium | Medium | Medium | High | Low | Low | Selected |
| 2 | Reset public-link Jest mock implementations between tests | Low | Low | Medium | Medium | Medium | High | Low | Low | Later |
| 3 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: register/login now trim and lowercase email before validation, using the same normalized value for validation and Prisma lookup/storage. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_auth-email-normalization-plan.md`.

## 2026-06-26 Cycle 23

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; trip sharing accepts any non-empty email string and lets malformed values hit user lookup.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Validate trip-share invite email format before DB lookup | Medium | High | Medium | Medium | Medium | High | Low | Low | Selected |
| 2 | Reset public-link Jest mock implementations between tests | Low | Low | Medium | Medium | Medium | High | Low | Low | Later |
| 3 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: `POST /api/trips/[id]/share` now validates the trimmed lowercase invite email before user lookup, returning `400` for malformed values and preserving valid share behavior. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_share-email-format-plan.md`.

## 2026-06-26 Cycle 24

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; Google Place activity creation casts optional time/duration fields without validation.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Validate Google Place suggestedTime and durationMinutes before create | Medium | High | High | Medium | Medium | High | Low | Low | Selected |
| 2 | Reset public-link/share Jest mock implementations between tests | Low | Low | Medium | Medium | Medium | High | Low | Low | Later |
| 3 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: Google Place activity creation now reuses the existing suggested-time and duration validators before duplicate checks/create, rejecting invalid optional fields with `400`. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_google-place-field-validation-plan.md`.

## 2026-06-26 Cycle 25

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; itinerary PATCH array entries are dereferenced before object-shape validation.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Reject null/scalar itinerary PATCH entries with 400 | Medium | High | High | Medium | Medium | High | Low | Low | Selected |
| 2 | Validate generated itinerary duplicate/missing item ids before transaction | Medium | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |
| 3 | Reset public-link/share Jest mock implementations between tests | Low | Low | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: itinerary PATCH now validates each array entry is an object before reading fields, so `[null]` and scalar entries return `400` without hitting the transaction or server-error path. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_itinerary-patch-item-shape-plan.md`.

## 2026-06-26 Cycle 26

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; itinerary PATCH validates ids exist but accepts duplicate ids in the same request.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Reject duplicate itinerary PATCH item ids before transaction | Medium | High | High | Medium | Medium | High | Low | Low | Selected |
| 2 | Validate generated itinerary duplicate/missing item ids before transaction | Medium | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |
| 3 | Reset public-link/share Jest mock implementations between tests | Low | Low | Medium | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: itinerary PATCH now tracks ids during validation and rejects duplicates with `400` before opening the transaction, preventing ambiguous double-updates. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_itinerary-patch-duplicate-id-plan.md`.

## 2026-06-26 Cycle 27

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; LLM itinerary organization validates item count but not id uniqueness.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Reject duplicate LLM itinerary ids before update transaction | Medium | High | High | Medium | Medium | High | Low | Low | Selected |
| 2 | Reset public-link/share Jest mock implementations between tests | Low | Low | Medium | Medium | Medium | High | Low | Low | Later |
| 3 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: itinerary organization now requires normalized LLM item ids to be unique and cover the existing item count before running updates, rejecting duplicate-id mappings with the existing validation `500`. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Added GOTCHA note about stale `mockResolvedValueOnce` queues after `clearAllMocks`. Archived plan: `docs/plans/archived/2026-06-26_itinerary-organize-duplicate-id-plan.md`.

## 2026-06-26 Cycle 28

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; `/api/weather` silently accepts malformed `days` values via `parseInt` fallback.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Reject malformed weather `days` query values before fetch | Medium | High | Medium | Medium | Medium | High | Low | Low | Selected |
| 2 | Reset route-test mock implementations where `mockResolvedValueOnce` is used | Low | Low | Medium | Medium | Medium | High | Medium | Low | Later |
| 3 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Investigate dev-only Jest audit chain without downgrading Jest | Low | Medium | Medium | Low | Medium | Medium | High | High | Later |

Completed: `/api/weather` now rejects non-digit `days` query values with `400` before any external fetch, while preserving default/clamp behavior for valid numeric input. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_weather-days-validation-plan.md`.

## 2026-06-26 Cycle 29

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; sharing a trip with an existing member can force their role to `viewer` through the upsert update branch.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Preserve existing trip member roles in share upsert update branch | High | High | High | Medium | Medium | High | Low | Low | Selected |
| 2 | Reset route-test mock implementations where `mockResolvedValueOnce` is used | Low | Low | Medium | Medium | Medium | High | Medium | Low | Later |
| 3 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Validate weather numeric array shape before rounding | Low | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |

Completed: trip sharing now keeps the upsert update branch as a no-op, preserving existing member roles while new shares still create viewer membership. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_share-preserve-existing-role-plan.md`.

## 2026-06-26 Cycle 30

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; generated activity creation checks `city` truthiness but not that it is a string.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Validate generated activity `city` type before AI/geocoding work | Medium | High | High | Medium | Medium | High | Low | Low | Selected |
| 2 | Reset route-test mock implementations where `mockResolvedValueOnce` is used | Low | Low | Medium | Medium | Medium | High | Medium | Low | Later |
| 3 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Validate weather numeric array shape before rounding | Low | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |

Completed: generated activity creation now trims and validates `city` as a string before preference lookup, AI generation, geocoding, or transaction work. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-generate-city-validation-plan.md`.

## 2026-06-26 Cycle 31

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; single-activity approve updates status before itinerary writes outside a transaction.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Wrap activity approve status and itinerary writes in one transaction | High | High | High | Medium | Medium | High | Medium | Low | Selected |
| 2 | Wrap activity reject status change with related itinerary cleanup decision | Medium | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |
| 3 | Reset route-test mock implementations where `mockResolvedValueOnce` is used | Low | Low | Medium | Medium | Medium | High | Medium | Low | Later |
| 4 | Validate weather numeric array shape before rounding | Low | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |

Completed: single-activity approve now performs status update, optional itinerary creation, and full itinerary read inside one Prisma transaction, preserving the approved payload response. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-approve-transaction-plan.md`.

## 2026-06-26 Cycle 32

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; rejecting an activity leaves any existing itinerary item in both DB and local trip detail state.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Delete itinerary entries atomically when rejecting an activity and update local itinerary state | High | High | High | Medium | Medium | High | Medium | Low | Selected |
| 2 | Reset route-test mock implementations where `mockResolvedValueOnce` is used | Low | Low | Medium | Medium | Medium | High | Medium | Low | Later |
| 3 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |
| 4 | Validate weather numeric array shape before rounding | Low | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |

Completed: activity reject now deletes itinerary rows and updates status inside one transaction, and trip detail removes rejected activities from local itinerary state immediately. Verification passed: targeted red/green API and UI Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-reject-itinerary-cleanup-plan.md`.

## 2026-06-26 Cycle 33

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; generated activity rows are trusted as typed after JSON parsing from the LLM.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Validate LLM-generated activity rows before geocoding/Prisma writes | High | High | High | Medium | Medium | High | Medium | Low | Selected |
| 2 | Validate weather numeric array shape before rounding | Low | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |
| 3 | Reset route-test mock implementations where `mockResolvedValueOnce` is used | Low | Low | Medium | Medium | Medium | High | Medium | Low | Later |
| 4 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |

Completed: generated activity creation now normalizes LLM rows before geocoding/Prisma writes and drops malformed generated rows while preserving valid rows. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_generated-activity-output-validation-plan.md`.

## 2026-06-26 Cycle 34

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; activity PATCH finite-but-out-of-range coordinates can make coordinate normalization return no row before `.lat` access.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Reject out-of-range activity PATCH coordinates before reading normalized result | High | High | High | Medium | Medium | High | Low | Low | Selected |
| 2 | Validate weather numeric array shape before rounding | Low | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |
| 3 | Reset route-test mock implementations where `mockResolvedValueOnce` is used | Low | Low | Medium | Medium | Medium | High | Medium | Low | Later |
| 4 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |

Completed: activity PATCH now checks coordinate normalization before reading `.lat`/`.lng`, returning `400` for finite but out-of-range coordinate pairs without updating the DB. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-patch-coordinate-range-plan.md`.

## 2026-06-26 Cycle 35

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; manual and Google Place activity create paths can still read missing normalized coordinates for finite out-of-range values.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Reject out-of-range manual/Google Place create coordinates before DB create | High | High | High | Medium | Medium | High | Low | Low | Selected |
| 2 | Validate weather numeric array shape before rounding | Low | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |
| 3 | Reset route-test mock implementations where `mockResolvedValueOnce` is used | Low | Low | Medium | Medium | Medium | High | Medium | Low | Later |
| 4 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |

Completed: manual and Google Place activity creation now checks coordinate normalization before reading `.lat`/`.lng`, returning `400` for finite but out-of-range pairs without creating activities. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-create-coordinate-range-plan.md`.

## 2026-06-26 Cycle 36

Baseline: working tree clean on pushed branch `improve/trip-post-validation`; activity PATCH rejects numeric-string `durationMinutes` even though create/schedule routes normalize numeric strings.

| Rank | Candidate | User impact | Correctness | Reliability | Dev speed | Maintainability | Verification clarity | Effort | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Normalize numeric-string activity PATCH durationMinutes consistently | Medium | Medium | Medium | Medium | Medium | High | Low | Low | Selected |
| 2 | Validate weather numeric array shape before rounding | Low | Medium | Medium | Low | Medium | Medium | Medium | Medium | Later |
| 3 | Reset route-test mock implementations where `mockResolvedValueOnce` is used | Low | Low | Medium | Medium | Medium | High | Medium | Low | Later |
| 4 | Reject no-op public-link DELETE when token is already null | Low | Low | Low | Medium | Medium | High | Low | Low | Later |

Completed: activity PATCH now normalizes numeric-string `durationMinutes` with `Number(raw)` before integer/positive validation, while preserving clearing and invalid-value rejection. Verification passed: targeted red/green Jest, full Jest, lint, Prisma generate, build, and `prek run -a`. Archived plan: `docs/plans/archived/2026-06-26_activity-patch-duration-string-plan.md`.
