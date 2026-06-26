## Goal
Validate LLM-generated activity objects before geocoding or saving them.

## Context
`generateActivities` returns parsed JSON from an LLM. The route currently treats each item as typed and can pass malformed fields such as blank titles, unsupported `suggestedTime`, or non-numeric `durationMinutes` into geocoding/Prisma.

## Non-Goals
- Do not change manual or Google Place activity creation.
- Do not change the LLM prompt or provider behavior.

## Plan
- [x] Add a Jest route test where generated activities include one malformed object and one valid object; expect only the valid object to be geocoded/saved. Verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].activities.test.ts' --runInBand` failing before implementation.
- [x] Normalize generated activity fields before geocoding: require non-empty string `title`/`description`, normalize optional `city`, validate/default `type`, `suggestedTime`, and `durationMinutes` using existing helpers, and drop invalid generated rows. Verified the targeted Jest test passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Invalid LLM rows will be silently dropped; this matches existing unresolved-geocode behavior and preserves valid rows.

## Completion Checklist
- [x] Malformed LLM-generated activity rows are not geocoded or saved, verified by Jest.
- [x] Valid generated activity rows still save, verified by existing and new Jest coverage.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
