## Goal
Make trip deletion atomic so a failure during child-row cleanup cannot leave a partially deleted trip.

## Context
`DELETE /api/trips/[id]` deletes itinerary items, activities, members, and the trip through separate Prisma calls. A mid-sequence failure can leave orphaned or half-deleted trip data.

## Non-Goals
- Do not change authorization or 404 behavior.
- Do not add database migrations or cascade constraints.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.trips.[id].test.ts` requiring trip deletion cleanup to run inside `prisma.$transaction`; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].test.ts' --runInBand` failing before implementation.
- [x] Update `src/app/api/trips/[id]/route.ts` to perform itinerary item, activity, member, and trip deletes inside one Prisma transaction; verified with the targeted Jest test.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Transaction wrapper should not change successful delete behavior; failed deletes now roll back instead of partially applying.

## Completion Checklist
- [x] Trip delete cleanup and final delete run inside one transaction, verified by Jest.
- [x] Existing not-found and authorization behavior remains unchanged, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
