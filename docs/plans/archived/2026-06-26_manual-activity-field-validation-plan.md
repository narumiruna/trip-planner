## Goal
Reject invalid manual activity `type`, `suggestedTime`, and `durationMinutes` values before writing activity records.

## Context
The manual activity route now uses a typed payload after Cycle 3, but still casts user-supplied `type`, `suggestedTime`, and `durationMinutes` into Prisma writes. Bad values can create activities with unknown types, impossible time blocks, or non-positive durations.

## Non-Goals
- Do not change Google-place imports or AI-generated activity normalization.
- Do not redesign the manual activity form.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.trips.[id].activities.test.ts` for invalid manual `type`, `suggestedTime`, and `durationMinutes`; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].activities.test.ts' --runInBand` failing before implementation.
- [x] Update `src/app/api/trips/[id]/activities/route.ts` to default missing manual `type`/`suggestedTime` safely, reject unsupported manual values, and normalize positive integer `durationMinutes`; verified with the targeted Jest test.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Malformed API callers that previously stored invalid manual activity fields will now receive 400; this is intended.

## Completion Checklist
- [x] Invalid manual `type`, `suggestedTime`, and `durationMinutes` return 400 and do not write, verified by Jest.
- [x] Existing valid manual activity creation still stores the selected type/time/duration, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
