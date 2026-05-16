# Tuition Tracker Implementation TODO

## DB + API
- [ ] Create `tuitions` table schema in `lib/db/src/schema/tuitions.ts` (match provided fields + `session_duration_hours`).
- [ ] Export `tuitionsTable` from `lib/db/src/schema/index.ts`.
- [ ] Add `artifacts/api-server/src/routes/tuitions.ts` (CRUD endpoints).
- [ ] Mount tuitions router in `artifacts/api-server/src/routes/index.ts`.
- [ ] Update `lib/api-spec/openapi.yaml` with tuition schemas + paths.
- [ ] Regenerate API clients/types via orval.

## Frontend
- [ ] Add route(s) for Tuition Tracker in `artifacts/house-finder/src/App.tsx`.
- [ ] Add “Tuition Tracker” navigation entry in `artifacts/house-finder/src/pages/Dashboard.tsx`.
- [ ] Implement `artifacts/house-finder/src/pages/TuitionTracker.tsx` (list + compare + calculations).
- [ ] Implement `artifacts/house-finder/src/pages/TuitionForm.tsx` (multi-section form + session duration input).

## Validate
- [ ] Build/typecheck backend + frontend.
- [ ] Smoke test: create/edit/list tuition; run comparison hourly/net calculations.

