## Goal
Replace the deprecated `next lint` package script with the ESLint CLI while preserving the existing lint pass.

## Context
`npm run lint` currently passes but prints a Next.js 15 deprecation warning that `next lint` will be removed in Next.js 16. A direct ESLint CLI invocation works with the existing `.eslintrc.json`.

## Non-Goals
- Do not migrate to flat ESLint config.
- Do not upgrade Next, ESLint, or eslint-config-next.

## Plan
- [x] Record the failing deprecation check by asserting `package.json` no longer contains `next lint`; verified red with `node -e "process.exit(require('./package.json').scripts.lint.includes('next lint') ? 1 : 0)"` failing before implementation.
- [x] Update `package.json` `lint` script to use `eslint src e2e --ext .js,.jsx,.ts,.tsx`; verified `npm run lint` passes without the Next deprecation warning.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- ESLint CLI target paths differ from `next lint`; keep the change scoped to source and e2e files that contain the app/test code.

## Completion Checklist
- [x] `package.json` no longer invokes `next lint`, verified by file check.
- [x] `npm run lint` passes without the deprecation warning.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
