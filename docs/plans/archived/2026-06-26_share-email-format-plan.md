## Goal
Reject malformed trip-share invite emails before database lookup.

## Context
`POST /api/trips/[id]/share` only checks that `email` is a non-empty string. A malformed value like `not-an-email` reaches `prisma.user.findUnique` and returns `404`, which blurs invalid input with a missing user.

## Non-Goals
- Do not change share authorization or member role behavior.
- Do not add email invitations for users who do not exist.

## Plan
- [x] Add a Jest route test that sends a malformed email and expects `400` with no user lookup; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].share.test.ts' --runInBand` failing before implementation.
- [x] Reuse `validateEmail` on the trimmed lowercase email before `prisma.user.findUnique`; verified the targeted test passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Existing clients sending malformed emails will get `400` instead of `404`; this is the correct trust-boundary behavior.

## Completion Checklist
- [x] Malformed share invite emails return `400` before user lookup, verified by Jest.
- [x] Valid share flow still upserts viewer membership, verified by existing Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
