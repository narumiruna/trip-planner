## Goal
Prevent partial preference updates from clearing omitted fields.

## Context
`PUT /api/me/preferences` currently normalizes omitted `likes`, `dislikes`, `budget`, and `preferredLanguage` to empty arrays/null, so a client that updates only one field can accidentally wipe the others.

## Non-Goals
- Do not change `POST /api/me/preferences` defaults.
- Do not change the preferences UI payload shape.

## Plan
- [x] Add a Jest route test that `PUT` with only `budget: "luxury"` updates only `budget` and leaves omitted list/language fields out of the Prisma update data. Verified red with `npm test -- --runTestsByPath src/__tests__/api.me.preferences.test.ts --runInBand` failing before implementation.
- [x] In `PUT`, validate and include only fields present in the request body; keep explicit `null`/empty strings as clear operations. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- API clients depending on omitted fields being cleared by `PUT` will need to send explicit null/empty values; this is safer and matches PATCH-like client behavior already common in the app.

## Completion Checklist
- [x] Omitted preference fields are not written during PUT, verified by Jest.
- [x] Existing preference validation behavior still passes.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
