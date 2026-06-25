## Goal
Make `POST /api/trips/[id]/activities/fill` return clear 400 responses for malformed JSON or non-object bodies before reading fields.

## Context
The fill endpoint is called by the manual activity form's "AI fill" action. It still calls `req.json()` directly, unlike the hardened activity create endpoint.

## Non-Goals
- Do not change LLM fill or geocoding behavior.
- Do not change authorization or trip lookup behavior for valid bodies.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.trips.[id].activities.fill.test.ts` for invalid JSON and non-object JSON bodies; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].activities.fill.test.ts' --runInBand` failing before implementation.
- [x] Update `src/app/api/trips/[id]/activities/fill/route.ts` to parse JSON in a try/catch, require a JSON object before field reads, and keep existing title/city validation; verified with the targeted Jest test.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Malformed callers that previously threw or fell through to title/city validation now get an earlier 400; this is intended.

## Completion Checklist
- [x] Invalid JSON returns 400 and does not query trip/fill/geocode, verified by Jest.
- [x] Non-object JSON returns 400 and does not query trip/fill/geocode, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
