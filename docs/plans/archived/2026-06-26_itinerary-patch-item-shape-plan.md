## Goal
Reject malformed itinerary PATCH array entries with `400` instead of falling into the server-error catch block.

## Context
`PATCH /api/trips/[id]/itinerary` validates the request body is an array, then reads `item.id` for each entry. If an entry is `null` or a scalar, the route throws and returns `500` rather than a client error.

## Non-Goals
- Do not change valid itinerary update semantics.
- Do not alter LLM itinerary organization behavior.

## Plan
- [x] Add a Jest route test sending `[null]` to itinerary PATCH and expecting `400` with no transaction; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].itinerary.test.ts' --runInBand` failing before implementation.
- [x] Add a minimal object-shape guard before reading item fields; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- None expected; malformed client input now gets the same `400` path as other invalid item fields.

## Completion Checklist
- [x] Null/scalar itinerary PATCH entries return `400`, verified by Jest.
- [x] Existing valid and invalid itinerary PATCH tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
