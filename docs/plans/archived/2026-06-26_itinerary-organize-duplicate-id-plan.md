## Goal
Reject duplicate item ids returned by LLM itinerary organization before updating rows.

## Context
`POST /api/trips/[id]/itinerary` filters LLM output to known item ids and checks the count, but duplicate ids can keep the same count while omitting another item. That can update one itinerary row twice and leave another untouched.

## Non-Goals
- Do not change successful itinerary organization behavior.
- Do not alter manual itinerary PATCH validation.

## Plan
- [x] Add a Jest route test where `organizeItinerary` returns duplicate ids and expect a `500` validation error with no transaction; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].itinerary.test.ts' --runInBand` failing before implementation.
- [x] Require the normalized LLM output ids to be unique and cover all existing item ids before running the transaction; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- None expected; duplicate LLM mappings are invalid and already represented as server-side LLM validation failures.

## Completion Checklist
- [x] Duplicate LLM itinerary ids return validation `500` before transaction, verified by Jest.
- [x] Existing valid organize flow still passes.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
