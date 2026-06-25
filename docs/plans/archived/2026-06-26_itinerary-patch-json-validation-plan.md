## Goal
Make `PATCH /api/trips/[id]/itinerary` return 400 for malformed JSON instead of logging and returning a generic 500.

## Context
The itinerary PATCH route validates array shape and item fields, but its `req.json()` call is inside the broad update `try/catch`. Malformed JSON is therefore treated as a server failure.

## Non-Goals
- Do not change valid itinerary reorder/update behavior.
- Do not change AI itinerary organization behavior.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.trips.[id].itinerary.test.ts` for invalid JSON on `PATCH /api/trips/[id]/itinerary`; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].itinerary.test.ts' --runInBand` failing before implementation.
- [x] Update `src/app/api/trips/[id]/itinerary/route.ts` to parse JSON in a dedicated try/catch before update work and keep existing array/item validation; verified with the targeted Jest test.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Malformed clients now receive a more specific 400 instead of a 500; this is intended.

## Completion Checklist
- [x] Malformed JSON returns 400 and does not query itinerary items, verified by Jest.
- [x] Existing valid PATCH behavior still updates and returns itinerary items, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
