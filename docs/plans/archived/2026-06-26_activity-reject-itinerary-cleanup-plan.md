## Goal
Remove itinerary entries when an activity is rejected.

## Context
Rejecting an activity only changes its status. Any existing itinerary item remains in the database and local trip detail state, so rejected activities can stay arranged until another cleanup path removes them.

## Non-Goals
- Do not change approve behavior.
- Do not delete the activity itself.

## Plan
- [x] Add API Jest coverage that reject deletes itinerary rows and updates status inside one transaction; verified red with `npm test -- --runTestsByPath src/__tests__/api.activities.integration.test.ts --runInBand` failing before implementation.
- [x] Add a trip-detail UI test proving rejecting an arranged activity removes it from the rendered itinerary state; verified red with `npm test -- --runTestsByPath src/__tests__/trip-detail.reject-itinerary.test.tsx --runInBand` failing before implementation.
- [x] Wrap reject cleanup/status update in a transaction and remove the rejected activity from local itinerary state on successful reject; verified targeted tests pass.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Users rejecting an activity will lose its itinerary placement; this matches the rejected state and avoids stale arrangements.

## Completion Checklist
- [x] Reject route deletes itinerary rows and updates status atomically, verified by Jest.
- [x] Trip detail removes rejected activity from itinerary state immediately, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
