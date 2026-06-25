## Goal
Make local `just ci` run Prisma generation like GitHub Actions CI.

## Context
The GitHub Actions workflow runs `npx prisma generate` after install, but the local `just ci` recipe currently skips `db-generate`. Clean local environments can then fail type/build checks with missing Prisma client types even though the workflow path is correct.

## Non-Goals
- Do not reorder unrelated CI steps.
- Do not change Prisma schema or generated artifacts.

## Plan
- [x] Add Jest coverage that requires the `just ci` recipe to include `db-generate` after install/audit; verified red with `npm test -- --runTestsByPath src/__tests__/ci.workflow.test.ts --runInBand` failing before implementation.
- [x] Update `justfile` so `ci` depends on `db-generate` before lint/tests/build; verified targeted Jest and `just --dry-run ci`.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- `just ci` will spend a small amount of extra time generating Prisma; this matches the protected CI workflow and avoids clean-environment failures.

## Completion Checklist
- [x] `just ci` includes `db-generate`, verified by Jest and dry-run.
- [x] GitHub Actions CI remains unchanged except prior audit coverage, verified by existing Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
