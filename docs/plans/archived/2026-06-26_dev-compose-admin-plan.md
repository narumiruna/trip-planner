## Goal
Start a Docker Compose dev environment with `just dev up`, seed a default dev admin account, and pre-fill that account on the auth page.

## Context
The repo currently has a production `docker-compose.yml` and `just dev` starts the local Next dev server. There is no `compose.dev.yml`, no dev-account seed, and the auth page starts with empty credentials.

## Non-Goals
- Do not add a production admin role or change the Prisma schema.
- Do not auto-submit the login form.

## Plan
- [x] Add failing Jest specs for the dev compose/just wiring, dev-admin seed credential normalization, and auth-page prefill; verified red with `npm test -- --runTestsByPath src/__tests__/dev-compose-admin.test.tsx --runInBand`.
- [x] Add `compose.dev.yml`, a `just dev up` path, and a small dev-admin seed script; verified `just --dry-run dev up` uses `compose.dev.yml`, compose runs as the non-root `node` user to avoid root-owned host artifacts, and startup avoids lockfile-mutating `npm install`.
- [x] Prefill `/auth` from dev-only public env vars set by `compose.dev.yml`; verified targeted Jest passes.
- [x] Update changelog and archive this plan after full verification.

## Completion Checklist
- [x] `just dev up` starts Docker Compose with `compose.dev.yml`, verified by justfile/compose tests, `docker compose -f compose.dev.yml config`, `just --dry-run dev up`, and a compose smoke run.
- [x] The dev compose environment seeds a default admin account, verified by seed-script tests, compose command wiring, compose logs showing `Dev admin ready: admin@example.test`, and a successful `/api/auth/login` smoke request.
- [x] The auth page auto-fills the dev admin email/password in the `just dev up` environment, verified by React Testing Library and compose-served `/auth` HTML.
- [x] Full checks pass: targeted Jest, full Jest, lint, Prisma generate, build, `prek run -a`, and compose smoke including login.
