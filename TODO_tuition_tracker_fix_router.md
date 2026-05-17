# TODO: Fix tuition-tracker route 404 (/tuition-tracker/new)

## Information gathered
- Router is implemented in `artifacts/house-finder/src/App.tsx` using `wouter`.
- Existing routes registered in `App.tsx`:
  - `/` -> Dashboard
  - `/tuition-tracker` -> TuitionTracker
  - `/listings/new` -> ListingForm
  - `/listings/:id` -> ListingDetail
  - `/listings/:id/edit` -> ListingForm
  - `/compare` -> Compare
  - fallback -> NotFound
- There is a `TuitionForm` component in `artifacts/house-finder/src/pages/TuitionForm.tsx`, but it is not currently registered in the router.
- The placeholder button in `TuitionTracker.tsx` links to `/tuition-tracker/new`.
- The `NotFound` page shows: “404 Page Not Found Did you forget to add the page to the router?”

## Edit plan
1. Update router in `artifacts/house-finder/src/App.tsx`:
   - Import `TuitionForm` (already imported).
   - Add a route mapping:
     - `/tuition-tracker/new` -> `TuitionForm`
     - (optional if supported) `/tuition-tracker/:id` -> `TuitionForm` for edit.
2. Ensure `TuitionTracker.tsx` Link uses the same path prefix as the router.
3. Verify by running/reloading the app and navigating to:
   - `/tuition-tracker`
   - `/tuition-tracker/new`
4. If the 404 disappears but console still has the `addListener` TypeError, isolate whether it is produced by our app code or an external script.

## Followup steps
- Test in browser: confirm UI renders TuitionForm placeholder instead of NotFound.
- If required, adjust any base path behavior using `WouterRouter base={import.meta.env.BASE_URL...}`.

