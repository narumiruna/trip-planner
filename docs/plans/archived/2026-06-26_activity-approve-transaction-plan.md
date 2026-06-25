## Goal
Approve an activity and create/read its itinerary item in one database transaction.

## Context
`POST /api/activities/[id]/approve` currently updates the activity status before creating the itinerary item. If the itinerary write fails, the activity can remain approved without an itinerary entry.

## Non-Goals
- Do not change authorization or response shape.
- Do not change reject behavior in this cycle.

## Plan
- [x] Add Jest coverage proving approve status update and itinerary writes use `prisma.$transaction`; verified red with `npm test -- --runTestsByPath src/__tests__/api.activities.integration.test.ts --runInBand` failing before implementation.
- [x] Move the activity update, optional itinerary create, and full itinerary read into one transaction; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Mock setup needs to reflect the transaction client; keep the change scoped to the approve route.

## Completion Checklist
- [x] Approve route uses the transaction client for status and itinerary writes, verified by Jest.
- [x] Existing approved payload response remains intact, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
