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
