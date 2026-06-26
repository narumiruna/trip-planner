## Goal
Reject invalid preference `budget` and `preferredLanguage` values before they reach Prisma writes.

## Context
`/api/me/preferences` now validates JSON shape and likes/dislikes arrays. `budget` is still cast into Prisma as a nullable string, so unsupported values or non-string truthy values can store invalid data or fail at runtime. The UI only offers a small fixed budget and language set.

## Non-Goals
- Do not change existing accepted budget/language values.
- Do not change likes/dislikes validation.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.me.preferences.test.ts` for unsupported `budget` on POST and non-string `preferredLanguage` on PUT; verified red with `npm test -- --runTestsByPath src/__tests__/api.me.preferences.test.ts --runInBand` failing before implementation.
- [x] Update `src/app/api/me/preferences/route.ts` to normalize blank `budget`/`preferredLanguage` to `null`, accept only UI-supported values plus existing `ja-JP`, and reject unsupported/non-string values; verified with the targeted Jest test.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- API callers using unsupported preference values now receive 400; this aligns server behavior with the UI contract.

## Completion Checklist
- [x] Invalid `budget`/`preferredLanguage` values return 400 and skip preference create/update writes, verified by Jest.
- [x] Existing valid preference create/update behavior still passes, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
