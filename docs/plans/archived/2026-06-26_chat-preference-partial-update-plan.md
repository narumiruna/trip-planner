## Goal
Prevent chat preference updates from clearing omitted fields.

## Context
Chat `preference.updateMe` actions default omitted lists to `[]` and omitted optional strings to `null` during execution. A chat action that only changes budget can wipe likes, dislikes, or language from an existing preference row.

## Non-Goals
- Do not change `/api/me/preferences`; it was fixed separately.
- Do not change chat planning prompts.

## Plan
- [x] Add a Jest execution test where an existing preference receives chat action `{ type: "preference.updateMe", budget: "luxury" }`; expect Prisma update data to contain only `budget`. Verified red with `npm test -- --runTestsByPath src/__tests__/chatbot.execute.test.ts --runInBand` failing before implementation.
- [x] Preserve omitted `budget`/`preferredLanguage` during validation and build chat preference update payloads from only defined fields; keep create defaults for missing rows. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Existing chat actions that expected omitted fields to clear data must now send explicit null/list values; this is safer for user preference preservation.

## Completion Checklist
- [x] Existing preference rows keep omitted fields during chat updates, verified by Jest.
- [x] Existing chat execution tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
