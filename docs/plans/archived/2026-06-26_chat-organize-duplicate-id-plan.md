## Goal
Reject duplicate itinerary item IDs from chat itinerary organization.

## Context
The API itinerary organizer rejects duplicate IDs, but chat `itinerary.organize` only checks that the LLM returned the same number of rows. A duplicated ID can pass length checks, update one item twice, and leave another itinerary item stale.

## Non-Goals
- Do not change LLM prompts.
- Do not change valid itinerary organization behavior.

## Plan
- [x] Add a Jest execution test where chat organization returns duplicate itinerary item IDs; expect execution to reject and not call `prisma.$transaction`. Verified red with `npm test -- --runTestsByPath src/__tests__/chatbot.execute.test.ts --runInBand` failing before implementation.
- [x] Require normalized organized item IDs to be unique before transaction. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Duplicate LLM organizer output now fails fast instead of partially applying; this is safer and matches the API route.

## Completion Checklist
- [x] Duplicate chat organizer IDs are rejected, verified by Jest.
- [x] Existing chat execution tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
