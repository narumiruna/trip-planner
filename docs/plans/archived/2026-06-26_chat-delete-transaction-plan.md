## Goal
Make chat activity deletion atomic with itinerary cleanup.

## Context
The normal activity delete route deletes itinerary references and the activity inside one Prisma transaction. Chat `activity.delete` still deletes itinerary items first and then the activity separately, so a failed activity delete can leave the trip with an activity whose itinerary placement was already removed.

## Non-Goals
- Do not change permission checks or route response shape.
- Do not refactor other chat action branches.

## Plan
- [x] Add a Jest execution test that chat `activity.delete` uses `prisma.$transaction` for itinerary cleanup plus activity delete. Verified red with `npm test -- --runTestsByPath src/__tests__/chatbot.execute.test.ts --runInBand` failing before implementation.
- [x] Wrap chat `activity.delete` cleanup and delete calls in one Prisma transaction. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- None expected; this matches the existing activity delete route behavior.

## Completion Checklist
- [x] Chat activity deletion uses one transaction, verified by Jest.
- [x] Existing chat execution tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
