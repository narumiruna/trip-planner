## Goal
Make `POST /api/trips/[id]/share` return 400 for malformed or non-object JSON bodies before user lookup/share writes.

## Context
Trip sharing is an access-control boundary. The route already requires owner access, but it calls `req.json()` directly before validating the invite email shape.

## Non-Goals
- Do not change share role behavior or membership upsert behavior.
- Do not add email deliverability or invitation features.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.trips.[id].share.test.ts` for invalid JSON and non-object JSON bodies; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].share.test.ts' --runInBand` failing before implementation.
- [x] Update `src/app/api/trips/[id]/share/route.ts` to parse JSON safely, require a JSON object, and keep existing email validation/user lookup behavior; verified with the targeted Jest test.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Malformed share callers now receive earlier 400 responses; valid sharing should be unchanged.

## Completion Checklist
- [x] Malformed/non-object share bodies return 400 and skip user lookup/upsert, verified by Jest.
- [x] Existing valid share behavior still passes, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
