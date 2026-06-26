## Goal
Reject malformed non-string/non-number `durationDays` values on trip create/update.

## Context
Trip create and patch routes convert `durationDays` with `Number(...)`. Boolean `true` becomes `1`, so malformed JSON can accidentally create or update a one-day trip instead of returning 400.

## Non-Goals
- Do not change valid numeric-string duration support.
- Do not change empty/null schedule clearing behavior.

## Plan
- [x] Add Jest route tests for boolean `durationDays` on `POST /api/trips` and `PATCH /api/trips/[id]`; expect 400 and no write. Verified red with `npm test -- --runTestsByPath src/__tests__/api.trips.test.ts 'src/__tests__/api.trips.[id].test.ts' --runInBand` failing before implementation.
- [x] Reject present `durationDays` values unless they are strings or numbers before numeric conversion in both trip routes. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Clients sending booleans now receive 400 instead of accidental one-day trips; this is intended.

## Completion Checklist
- [x] Boolean trip duration is rejected on create/update, verified by Jest.
- [x] Existing trip schedule tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
