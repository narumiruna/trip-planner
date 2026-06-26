## Goal
Validate Google Place activity `suggestedTime` and `durationMinutes` before saving.

## Context
Manual activity creation validates these fields, but the `google_place` branch casts client input directly into Prisma data. Bad values can become invalid itinerary time blocks or runtime Prisma errors.

## Non-Goals
- Do not change manual or generated activity behavior.
- Do not change Google Place duplicate detection.

## Plan
- [x] Add Jest coverage for invalid Google Place `suggestedTime` and `durationMinutes` returning `400` before create; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].activities.test.ts' --runInBand` failing before implementation.
- [x] Reuse the existing `normalizeManualSuggestedTime` and `normalizeDurationMinutes` helpers in the `google_place` branch; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Clients sending invalid optional fields will now get `400`; valid omitted values still default to `afternoon` and `null`.

## Completion Checklist
- [x] Invalid Google Place `suggestedTime`/`durationMinutes` return `400`, verified by Jest.
- [x] Valid Google Place creation remains covered by existing tests.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
