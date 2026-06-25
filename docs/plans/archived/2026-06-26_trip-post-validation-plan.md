## Goal
Harden `POST /api/trips` so malformed or invalid create-trip requests return clear 400 responses instead of throwing or storing unusable trips.

## Context
Baseline `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, and `npm run build` pass. `PATCH /api/trips/[id]` already validates body shape, name, and cities; create-trip does not.

## Non-Goals
- Do not change trip update behavior.
- Do not add client-side form UX beyond the API contract.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.trips.test.ts` for invalid JSON, non-object body, blank name, and empty/blank cities on `POST /api/trips`; verified red with `npm test -- src/__tests__/api.trips.test.ts --runInBand` failing before implementation.
- [x] Update `src/app/api/trips/route.ts` to parse JSON safely, require a JSON object, trim a non-empty `name`, require a non-empty array of non-empty trimmed `cities`, and preserve existing `startDate`/`durationDays` validation; verified with `npm test -- src/__tests__/api.trips.test.ts --runInBand`.
- [x] Update the progress log and changelog for this cycle; verified by file review of `docs/IMPROVEMENT_LOG.md` and `docs/CHANGELOG.md`.

## Risks
- Tightening API validation may reject malformed callers that previously created bad records; this is intended.

## Completion Checklist
- [x] Invalid `POST /api/trips` requests return 400 and do not enter the Prisma transaction, verified by targeted Jest tests.
- [x] Valid trip creation still stores trimmed, JSON-stringified cities and creates the owner membership, verified by `src/__tests__/api.trips.test.ts`.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
