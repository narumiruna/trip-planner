## Goal
Prevent manual and Google-place activity creation from saving null or partial coordinates as `(0, 0)`.

## Context
The trip detail UI sends `lat: null` and `lng: null` when a manual activity has no coordinate override. The API currently runs `Number(null)` and treats both values as valid zero coordinates, bypassing geocoding.

## Non-Goals
- Do not redesign activity forms.
- Do not change AI-generated activity geocoding.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.trips.[id].activities.test.ts` for manual `lat: null, lng: null` geocoding and Google-place null coordinates rejection; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].activities.test.ts' --runInBand` failing before implementation.
- [x] Update `src/app/api/trips/[id]/activities/route.ts` so manual creation geocodes when both coordinate fields are absent/null/blank, rejects partial or non-finite coordinates, and Google-place creation requires finite provided coordinates; verified with the targeted Jest test.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Tightened coordinate validation rejects malformed API callers that previously created bad `(0, 0)` activities; this is intended.

## Completion Checklist
- [x] Manual activity creation with null coordinates geocodes and saves the resolved coordinates, verified by Jest.
- [x] Google-place activity creation with null coordinates returns 400 and does not write, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
