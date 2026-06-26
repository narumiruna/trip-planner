## Goal
Make auth write endpoints return 400 for malformed or non-object JSON bodies instead of throwing at the authentication boundary.

## Context
`/api/auth/register`, `/api/auth/login`, and `/api/auth/change-password` call `req.json()` directly. These are security-sensitive trust boundaries and should reject malformed bodies consistently before user/session database work.

## Non-Goals
- Do not change password hashing, session creation, or credential checks.
- Do not change logout behavior.

## Plan
- [x] Add Jest coverage in `src/__tests__/api.auth.test.ts` for invalid JSON on register/change-password and non-object JSON on login; verified red with `npm test -- --runTestsByPath src/__tests__/api.auth.test.ts --runInBand` failing before implementation.
- [x] Update `src/app/api/auth/register/route.ts`, `src/app/api/auth/login/route.ts`, and `src/app/api/auth/change-password/route.ts` to parse JSON safely, require a JSON object, and keep existing field validation and auth flow; verified with the targeted Jest test.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Malformed callers now receive earlier 400 responses; this is intended and should not affect valid auth flows.

## Completion Checklist
- [x] Malformed/non-object auth bodies return 400 and skip user database work, verified by Jest.
- [x] Existing register/login/change-password success and failure cases still pass, verified by Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
