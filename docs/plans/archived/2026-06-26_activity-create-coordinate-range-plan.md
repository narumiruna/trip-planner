## Goal
Reject out-of-range activity creation coordinates with `400` instead of throwing.

## Context
Manual and Google Place activity creation parse coordinates for finiteness, then read `normalizeCoordinateBatch(...)[0]`. Finite but impossible coordinate pairs such as `999,999` produce no normalized row and can throw.

## Non-Goals
- Do not change coordinate swap/centroid heuristics.
- Do not change PATCH coordinate handling, already covered separately.

## Plan
- [x] Add Jest route coverage for manual and Google Place create payloads with `lat: 999, lng: 999`, expecting `400` and no DB create; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].activities.test.ts' --runInBand` failing before implementation.
- [x] Check normalized coordinate results in both creation branches and return the existing invalid-coordinate `400` response if normalization fails; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Clients sending impossible finite coordinates now receive `400`; valid and swappable coordinate pairs remain unchanged.

## Completion Checklist
- [x] Out-of-range manual and Google Place create coordinates return `400`, verified by Jest.
- [x] Existing manual and Google Place creation tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
