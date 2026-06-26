## Goal
Improve the current trip-planner interface based on direct visual review of the running app.

## Observed Screens
Reviewed in the `just dev up`/Compose dev environment with seeded dev admin data:
- `/auth`: login page with dev admin prefill.
- `/`: empty dashboard, create-trip form, and populated dashboard with trip cards.
- `/trips/[id]`: trip detail in empty, populated inspiration, itinerary, and map tabs.

## Current UI Findings
- The visual direction is close to the preferred boutique concierge style, but the page hierarchy is uneven: very large hero/title blocks dominate while the next actionable task can be secondary.
- Auth page still spends too much space on brand/value copy before the login task; the dev prefill banner is useful but visually competes with the form.
- Dashboard empty and populated states are clear, but duplicate CTAs (`+ 新增旅程`, `建立第一個旅程`) and large empty vertical space make the first action feel less focused.
- Trip detail has useful progress/readiness data, but top controls are scattered: `開啟行程`, `檢視靈感`, gear, tab bar, city filter, sort/filter pills, and manual-add accordion all compete in the first viewport.
- Activity cards have good density, but key next actions are inconsistent by status; pending approval is visible, while approved/planned cards lose an obvious next step.
- Itinerary view is functional but too tall/noisy: every empty day renders five drop zones, making a 5-day trip feel overwhelming after only two planned stops.
- Map view is helpful, but map controls/search/provider toggles are visually raw compared with the rest of the interface.

## Plan
- [x] Reduce auth-page brand theater and make login the primary object: shrink the left marketing column, keep the dev prefill notice as a small helper row, and preserve the boutique palette; verify with an auth screenshot at desktop and mobile widths.
- [x] Rework the dashboard hero into an action dashboard: keep greeting compact, promote the single recommended next action, and collapse duplicate empty-state CTAs into one primary CTA; verify empty and populated dashboard screenshots show one dominant next action.
- [x] Add a trip-detail command strip below the trip title: group primary actions (`產生靈感`, `全部核准`, `AI 整理行程`, `分享`) and move low-frequency controls (`編輯日期`, gear) into secondary placement; verify first viewport exposes status + next action without crowding.
- [x] Simplify trip readiness presentation: convert the big progress block and count rail into one compact readiness card with explicit missing step, percent, and counts; verify it remains readable with 0, partial, and complete planning data.
- [x] Normalize activity-card action hierarchy: pending cards should emphasize approve/reject; approved cards should emphasize add/reorder in itinerary or view on map; verify cards show one primary action per status.
- [x] Collapse itinerary empty days by default: show populated days expanded and empty days as compact rows with `新增到 Day N`; verify a 5-day itinerary fits more context above the fold.
- [x] Restyle map controls to match the app shell: move provider toggles/search/count summary into a single map toolbar and make route status legible; verify map tab screenshot has no raw-looking controls.

## Completion Checklist
- [x] Auth, dashboard, trip detail, itinerary, and map screens have updated screenshots showing reduced clutter and clearer next actions.
- [x] Each surface has one dominant primary action per state, verified by visual review and basic RTL assertions for primary CTAs.
- [x] Responsive behavior is checked at desktop and mobile widths for auth, dashboard, and trip detail.
- [x] Existing UI tests and core checks pass: `npm test -- --runInBand`, `npm run lint`, and `npm run build`.

## Evidence
- Screenshots captured under `/tmp/trip-planner-ui-plan-2026-06-26/`.
- Targeted RTL checks cover the auth primary panel, empty dashboard CTA, trip command strip, readiness card counts, approved-card itinerary action, compact itinerary empty days, and map toolbar controls.
