## Goal
Delete an activity and its itinerary references in one database transaction.

## Context
`DELETE /api/activities/[id]` currently deletes itinerary rows and then deletes the activity as separate Prisma calls. If the second write fails, the itinerary rows can already be gone. The trip delete route already uses a transaction for this pattern.

## Non-Goals
- Do not change authorization or response semantics.
- Do not refactor other activity update paths.

## Plan
- [x] Add a Jest route test proving activity deletion uses `prisma.$transaction`; verified red with `npm test -- --runTestsByPath src/__tests__/api.activities.integration.test.ts --runInBand` failing before implementation.
- [x] Wrap the itinerary-item delete and activity delete in one Prisma transaction; verified the targeted test passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Mock shape must match the Prisma transaction client; keep the transaction mock local to the new test.

## Completion Checklist
- [x] Activity deletion uses the transaction client for both child-row and activity deletes, verified by Jest.
- [x] Existing 204 response behavior is unchanged, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
