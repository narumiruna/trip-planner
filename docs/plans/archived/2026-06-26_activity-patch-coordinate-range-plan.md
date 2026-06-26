## Goal
Reject out-of-range activity PATCH coordinates with `400` instead of throwing.

## Context
`PATCH /api/activities/[id]` only checks that `lat`/`lng` are finite. If both finite numbers are outside valid coordinate ranges, `normalizeCoordinateBatch(...)[0]` is `undefined` and the route can throw while reading `.lat`.

## Non-Goals
- Do not change coordinate normalization heuristics.
- Do not change activity create coordinate handling.

## Plan
- [x] Add a Jest route test that patches `lat: 999, lng: 999` and expects `400` with no DB update; verified red with `npm test -- --runTestsByPath src/__tests__/api.activities.integration.test.ts --runInBand` failing before implementation.
- [x] Check the normalized coordinate result before reading it and return the existing invalid-coordinate `400` response when normalization fails; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Clients sending impossible finite coordinates now get a clear client error; valid and swappable coordinates remain unchanged.

## Completion Checklist
- [x] Out-of-range activity PATCH coordinates return `400`, verified by Jest.
- [x] Existing activity PATCH tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
