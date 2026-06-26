## Goal
Handle malformed LLM chat action plans without failing the plan endpoint.

## Context
`planTripActions` catches provider errors, but it still throws if the LLM returns a non-array or invalid `actionPlan`. That turns a valid user chat planning request into a 400 response instead of a safe empty plan.

## Non-Goals
- Do not relax `validateChatActionPlan` for API execute requests.
- Do not change LLM prompts.

## Plan
- [x] Add a Jest test where `generateChatActionPlan` returns a malformed `actionPlan`; expect `planTripActions` to return an empty plan summary instead of throwing. Verified red with `npm test -- --runTestsByPath src/__tests__/chatbot.validation.test.ts --runInBand` failing before implementation.
- [x] Catch validation failures inside `planTripActions`, log them, and fall back to an empty action plan. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Malformed LLM plans become no-op previews instead of visible 400 errors; execute validation remains strict, so unsafe actions still cannot run.

## Completion Checklist
- [x] Malformed LLM plan output returns a safe empty action plan, verified by Jest.
- [x] Existing chat validation tests still pass.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
