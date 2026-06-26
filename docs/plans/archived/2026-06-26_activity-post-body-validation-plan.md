## Goal
Make `POST /api/trips/[id]/activities` return clear 400 responses for malformed JSON or non-object request bodies instead of throwing or doing unnecessary database work.

## Context
Cycle 2 fixed coordinate parsing in this route. The same route still calls `req.json()` directly and then reads `body?.mode` / `body?.city`, so invalid JSON can throw and array/string bodies are not rejected at the boundary.

## Non-Goals
- Do not change manual activity field validation beyond the body boundary.
- Do not change activity generation, geocoding, or sorting behavior.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.trips.[id].activities.test.ts` for invalid JSON and non-object JSON bodies on `POST /api/trips/[id]/activities`; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].activities.test.ts' --runInBand` failing before implementation.
- [x] Update `src/app/api/trips/[id]/activities/route.ts` to parse JSON in a try/catch, require a JSON object before trip lookup, and use a typed payload object for existing mode/city reads; verified with the targeted Jest test.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Malformed callers that previously reached later route logic will now fail earlier with 400; this is intended.

## Completion Checklist
- [x] Invalid JSON returns 400 and does not query for the trip, verified by Jest.
- [x] Non-object JSON returns 400 and does not query for the trip, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
