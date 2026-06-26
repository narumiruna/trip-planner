## Goal
Require generated activity requests to provide `city` as a non-empty string.

## Context
The generated-activities branch of `POST /api/trips/[id]/activities` casts `payload.city` to `string | undefined` and only checks truthiness. Non-string truthy values can reach preference lookup, generation, geocoding, and Prisma data.

## Non-Goals
- Do not change manual or Google Place activity creation.
- Do not change generated activity output normalization.

## Plan
- [x] Add a Jest route test for non-string `city` expecting `400` before preference/generation work; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].activities.test.ts' --runInBand` failing before implementation.
- [x] Normalize the generated branch city with a string/trim check before downstream work; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Clients sending malformed `city` values now receive `400`; valid string city requests are unchanged.

## Completion Checklist
- [x] Non-string generated activity `city` returns `400`, verified by Jest.
- [x] Existing generated activity creation tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
