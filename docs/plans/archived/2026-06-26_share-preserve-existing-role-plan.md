## Goal
Prevent trip sharing from downgrading an existing member's role.

## Context
`POST /api/trips/[id]/share` uses `tripMember.upsert` with `update: { role: 'viewer' }`. If the invited user is already a member with a stronger role such as `owner`, the share call can downgrade them to viewer.

## Non-Goals
- Do not add new roles.
- Do not change the create path for new shared users; they should still become viewers.

## Plan
- [x] Add a Jest route test proving the share upsert update branch does not set `role: 'viewer'`; verified red with `npm test -- --runTestsByPath 'src/__tests__/api.trips.[id].share.test.ts' --runInBand` failing before implementation.
- [x] Change the upsert `update` payload to a no-op so existing member roles are preserved, while keeping `create.role = 'viewer'`; verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Existing viewers remain viewers, existing owners remain owners; this is safer than force-downgrading any existing member.

## Completion Checklist
- [x] Share upsert update branch is role-preserving, verified by Jest.
- [x] New share create path still creates viewer membership, verified by existing Jest.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
