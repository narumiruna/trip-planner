## Goal
Reject malformed chat-action coordinates before execution mutates activities.

## Context
Chat `activity.create` and `activity.update` actions validate coordinates only as finite numbers. Out-of-range pairs can later produce `undefined` from `normalizeCoordinateBatch`, causing a noisy create error or a silent update that ignores the requested coordinates.

## Non-Goals
- Do not change chat planning prompts or LLM output parsing.
- Do not add a schema validation library.

## Plan
- [x] Add a Jest validation test that an `activity.update` action with `lat: 999, lng: 999` throws an `Invalid coordinates` error. Verified red with `npm test -- --runTestsByPath src/__tests__/chatbot.validation.test.ts --runInBand` failing before implementation.
- [x] Reuse `normalizeCoordinateBatch` during chat action validation to require either no coordinates or a valid pair; return normalized/swapped coordinates when valid. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Chat actions with one coordinate now fail instead of being partially ignored; that matches the activity API behavior and avoids hidden no-ops.

## Completion Checklist
- [x] Invalid chat-action coordinate pairs are rejected before execution, verified by Jest.
- [x] Existing chat action validation behavior still passes.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
