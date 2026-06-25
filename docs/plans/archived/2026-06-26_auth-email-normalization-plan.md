## Goal
Validate login/register emails after trimming and lowercasing them.

## Context
Auth routes already store/look up `email.trim().toLowerCase()`, but they call `validateEmail(email)` before normalization. That can reject otherwise valid emails with accidental leading/trailing whitespace and validates a different value than the one sent to Prisma.

## Non-Goals
- Do not change password or name validation.
- Do not change session creation/cookie behavior.

## Plan
- [x] Add Jest coverage proving register and login pass the normalized email into `validateEmail`; verified red with `npm test -- --runTestsByPath src/__tests__/api.auth.test.ts --runInBand` failing before implementation.
- [x] Normalize email before validation in register and login, and use the same normalized value for Prisma; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Very low; this broadens acceptance for whitespace/case variants while preserving normalized storage and lookup.

## Completion Checklist
- [x] Register validates and stores the normalized email, verified by Jest.
- [x] Login validates and looks up the normalized email, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
