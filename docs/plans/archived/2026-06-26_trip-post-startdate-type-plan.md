## Goal
Reject malformed `startDate` types when creating trips.

## Context
`POST /api/trips` rejects malformed date strings but treats non-string `startDate` values as absent/null. A bad client can silently create a trip without the intended date instead of receiving a clear 400.

## Non-Goals
- Do not change trip PATCH validation.
- Do not change optional empty/null `startDate` clearing behavior.

## Plan
- [x] Add a Jest route test where trip creation sends numeric `startDate`; expect 400 and no transaction. Verified red with `npm test -- --runTestsByPath src/__tests__/api.trips.test.ts --runInBand` failing before implementation.
- [x] In `POST /api/trips`, reject present non-string/non-empty `startDate` before normalizing. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Clients sending invalid non-string dates now get 400 instead of silently losing the date; this is intended.

## Completion Checklist
- [x] Non-string trip creation `startDate` is rejected, verified by Jest.
- [x] Existing trip creation tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
