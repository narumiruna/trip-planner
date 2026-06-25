## Goal
Reject malformed weather `days` query parameters before external fetches.

## Context
`/api/weather` currently uses `parseInt(daysParam) || 7`, so values like `2abc` or `abc` silently become `2` or `7`. That hides client bugs and can make forecast ranges surprising.

## Non-Goals
- Do not change the existing 1–16 clamping for numeric day values.
- Do not change city/startDate validation or weather response shape.

## Plan
- [x] Add a Jest route test for `days=abc` expecting `400` and no fetch; verified red with `npm test -- --runTestsByPath src/__tests__/api.weather.test.ts --runInBand` failing before implementation.
- [x] Validate `days` as digits-only before parsing, preserving the current default and clamp for valid numeric strings; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Clients sending malformed `days` now receive `400`; numeric values continue to work as before.

## Completion Checklist
- [x] Malformed `days` returns `400` before fetch, verified by Jest.
- [x] Valid weather forecast test still passes.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
