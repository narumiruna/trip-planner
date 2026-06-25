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
