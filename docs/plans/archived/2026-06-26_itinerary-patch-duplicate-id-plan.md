## Goal
Reject duplicate itinerary item ids in `PATCH /api/trips/[id]/itinerary`.

## Context
The itinerary PATCH route verifies each submitted id exists but does not require ids to be unique. A duplicated id can update the same row twice and omit another visible item, producing inconsistent ordering.

## Non-Goals
- Do not require clients to submit every itinerary item.
- Do not change valid reorder/update behavior.

## Plan
- [x] Add a Jest route test that sends the same itinerary item id twice and expects `400` with no transaction; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].itinerary.test.ts' --runInBand` failing before implementation.
- [x] Track seen ids during validation and reject duplicates before the transaction; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Clients sending duplicate rows will now receive `400`, which prevents ambiguous updates.

## Completion Checklist
- [x] Duplicate itinerary PATCH ids return `400`, verified by Jest.
- [x] Existing valid itinerary PATCH tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
