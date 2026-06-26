## Goal
Allow numeric-string `durationMinutes` in activity PATCH while still rejecting invalid durations.

## Context
Activity creation accepts numeric strings for `durationMinutes`, and trip PATCH accepts numeric strings for `durationDays`. `PATCH /api/activities/[id]` currently checks `Number.isInteger(raw)`, so `{ "durationMinutes": "60" }` is rejected even though it can be safely normalized.

## Non-Goals
- Do not change duration validation bounds.
- Do not change create-route duration behavior.

## Plan
- [x] Add a Jest route test that patches `durationMinutes: "60"` and expects Prisma data `durationMinutes: 60`; verified red with `npm test -- --runTestsByPath src/__tests__/api.activities.integration.test.ts --runInBand` failing before implementation.
- [x] Normalize PATCH duration with `Number(raw)` before integer/positive validation, preserving `null`/empty-string clearing and invalid-value rejection; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- This broadens accepted input shape consistently; invalid strings still return `400`.

## Completion Checklist
- [x] Numeric-string activity PATCH duration saves as a number, verified by Jest.
- [x] Existing empty/invalid PATCH tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
