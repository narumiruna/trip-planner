## Goal
Make `/api/me/preferences` POST and PUT return 400 for malformed or non-object JSON bodies before preference database work.

## Context
The current-user preferences endpoint is authenticated but still calls `req.json()` directly in POST and PUT. Invalid bodies can throw instead of returning a clear client error.

## Non-Goals
- Do not change preference field semantics for valid bodies.
- Do not change deprecated `/api/users/[id]/preferences` responses.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.me.preferences.test.ts` for invalid JSON on POST and non-object JSON on PUT; verified red with `npm test -- --runTestsByPath src/__tests__/api.me.preferences.test.ts --runInBand` failing before implementation.
- [x] Update `src/app/api/me/preferences/route.ts` to parse JSON safely, require a JSON object in POST and PUT, and keep existing create/update logic; verified with the targeted Jest test.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Malformed callers now receive earlier 400 responses; valid preference saves should be unchanged.

## Completion Checklist
- [x] Malformed/non-object preference bodies return 400 and skip preference database work, verified by Jest.
- [x] Existing valid preference create/update behavior still passes, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
