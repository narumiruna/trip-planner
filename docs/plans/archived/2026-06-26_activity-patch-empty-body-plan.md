## Goal
Reject empty `PATCH /api/activities/[id]` bodies instead of issuing no-op database updates.

## Context
The activity PATCH route validates known fields but does not require at least one updatable field. `{}` currently reaches `prisma.activity.update({ data: {} })`, which is a pointless write path and can mask client bugs.

## Non-Goals
- Do not change validation rules for individual activity fields.
- Do not add support for new editable fields.

## Plan
- [x] Add a Jest route test that sends `{}` to `PATCH /api/activities/[id]` and expects `400` with no DB update; verified red with `npm test -- --runTestsByPath src/__tests__/api.activities.integration.test.ts --runInBand` failing before implementation.
- [x] Add the minimal guard after field normalization: if no update keys were collected, return `400` before `prisma.activity.update`; verified the targeted test passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- A client relying on no-op patches will now get `400`; this is appropriate because it exposes an invalid request.

## Completion Checklist
- [x] Empty activity PATCH bodies return `400`, verified by Jest.
- [x] Non-empty activity PATCH behavior remains covered by existing route tests.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
