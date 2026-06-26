## Goal
Add a production dependency audit gate to CI so high production vulnerabilities cannot regress unnoticed.

## Context
Cycle 12 cleared `npm audit --omit=dev`. The GitHub Actions CI workflow and local `just ci` recipe do not currently run that audit, so the same issue could return without failing CI.

## Non-Goals
- Do not fail CI on dev-only audit findings in this cycle.
- Do not change dependency versions.

## Plan
- [x] Add Jest workflow coverage requiring `.github/workflows/ci.yml` to run `npm audit --omit=dev`; verified red with `npm test -- --runTestsByPath src/__tests__/ci.workflow.test.ts --runInBand` failing before implementation.
- [x] Update `.github/workflows/ci.yml` and `justfile` so CI and local `just ci` run `npm audit --omit=dev` after install; verified with the targeted Jest test and `npm audit --omit=dev`.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- CI will now fail on production audit findings; this is intended and scoped to production dependencies only.

## Completion Checklist
- [x] CI workflow has a production audit step, verified by Jest and file review.
- [x] Local `just ci` includes the same production audit command, verified by file review.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
