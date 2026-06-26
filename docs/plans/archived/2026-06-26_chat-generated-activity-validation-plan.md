## Goal
Skip malformed LLM-generated activities in chat execution before geocoding or database writes.

## Context
The regular activity generation API validates generated rows before geocoding. Chat `activity.generate` casts LLM output to `GeneratedActivity[]`, so malformed rows can waste geocoding calls or save invalid values such as negative `durationMinutes`.

## Non-Goals
- Do not change LLM prompts or provider code.
- Do not change direct `/api/trips/[id]/activities` generation behavior.

## Plan
- [x] Add a Jest execution test where chat generation returns a row with negative `durationMinutes`; expect no geocoding or activity create call. Verified red with `npm test -- --runTestsByPath src/__tests__/chatbot.execute.test.ts --runInBand` failing before implementation.
- [x] Add minimal generated-row normalization in `src/lib/chatbot.ts` and use it before geocoding; require object rows with non-empty title/description, valid optional type/time, and positive-or-null duration. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Malformed generated suggestions are silently skipped instead of aborting chat execution; this matches the existing direct generation route and avoids bad writes.

## Completion Checklist
- [x] Invalid generated chat activities are skipped before geocoding/writes, verified by Jest.
- [x] Existing chat validation and execution tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
