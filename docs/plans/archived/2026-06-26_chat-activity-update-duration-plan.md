## Goal
Prevent chat activity updates from clearing duration when duration is omitted.

## Context
`validateChatAction` uses `normalizeOptionalDuration` for both create and update actions. For `activity.update`, an omitted `durationMinutes` currently becomes `null`, so a chat action that only changes the title can accidentally clear the existing duration.

## Non-Goals
- Do not change activity creation defaults.
- Do not change non-duration activity update fields.

## Plan
- [x] Add a Jest execution test where chat `activity.update` changes only `title`; expect Prisma update data not to include `durationMinutes`. Verified red with `npm test -- --runTestsByPath src/__tests__/chatbot.execute.test.ts --runInBand` failing before implementation.
- [x] Preserve omitted `durationMinutes` as `undefined` for `activity.update` while keeping explicit null/empty clears. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Existing chat actions that relied on omission to clear duration must send explicit null or empty string; preserving omitted data is safer.

## Completion Checklist
- [x] Omitted activity update duration is not written, verified by Jest.
- [x] Existing chat validation/execution tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
