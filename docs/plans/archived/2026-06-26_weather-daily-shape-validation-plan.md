## Goal
Skip malformed daily weather rows instead of returning null/unknown forecast values.

## Context
`/api/weather` maps `daily.time` and indexes sibling arrays without checking row completeness. If Open-Meteo returns missing or non-numeric temperature/code values, the API can serialize `NaN` as `null` and return misleading forecast entries.

## Non-Goals
- Do not change geocoding or fetch error handling.
- Do not add a weather schema dependency.

## Plan
- [x] Add a Jest route test where forecast `daily.time` has a row but temperature/code arrays are empty; expect an empty `forecasts` array. Verified red with `npm test -- --runTestsByPath src/__tests__/api.weather.test.ts --runInBand` failing before implementation.
- [x] Build forecasts with a minimal row guard requiring string date and finite numeric code/max/min values; skip malformed rows. Verified targeted Jest passes.
- [x] Update the progress log and changelog for this cycle; verified by file review.

## Risks
- Malformed upstream rows will disappear from the response instead of appearing with null values; this is safer for UI correctness.

## Completion Checklist
- [x] Malformed daily weather rows are skipped, verified by Jest.
- [x] Existing valid weather forecast behavior still passes.
- [x] Full project checks pass: `npm test -- --runInBand`, `npm run lint`, `npx prisma generate`, `npm run build`, and `prek run -a`.
