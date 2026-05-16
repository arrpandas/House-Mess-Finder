# TODO - Negotiation tracking fields

## Step 1: DB + OpenAPI
- [x] Add `negotiationStatus`, `finalNegotiatedRent`, `propertyAvailabilityStatus` columns to `lib/db/src/schema/listings.ts`
- [x] Update `lib/api-spec/openapi.yaml` Listing schemas (Listing, ListingInput, ListingUpdate)

## Step 2: Regenerate API types
- [ ] Run orval regeneration (generates `lib/api-zod` and `lib/api-client-react`)

## Step 3: API server

- [x] Update `artifacts/api-server/src/routes/listings.ts` to persist/return new fields


## Step 4: Frontend form
- [x] Update `artifacts/house-finder/src/pages/ListingForm.tsx` (schema, UI, defaults/reset, payload)

## Step 5: Frontend detail
- [x] Update `artifacts/house-finder/src/pages/ListingDetail.tsx` (display + share text)


## Step 6: Validate
- [ ] Build/typecheck frontend
- [ ] (If available) run backend typecheck/tests

