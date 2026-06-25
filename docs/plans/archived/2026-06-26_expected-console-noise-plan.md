## Goal
Remove expected `console.error` noise from Jest output while still asserting error paths behave correctly.

## Context
Full Jest passes but prints expected `console.error` output from itinerary error-path tests and the geocoding fetch-failure test. This makes real test failures harder to scan.

## Non-Goals
- Do not change production logging behavior.
- Do not globally silence all console errors in Jest.

## Plan
- [x] Record the failing noise check with the targeted itinerary/geocoding Jest run showing `console.error` in output; verified red with a grep-based command failing before implementation.
- [x] Spy on `console.error` only in tests that intentionally trigger error logging, assert the spy was called, and restore mocks after each test; verified targeted output has no `console.error` blocks.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Over-suppressing console errors can hide unexpected failures; mitigate by spying only in known error-path tests and asserting the log call happened.

## Completion Checklist
- [x] Targeted itinerary/geocoding test output has no `console.error` blocks, verified by grep.
- [x] Error-path assertions still confirm 500/null behavior and expected log calls, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
