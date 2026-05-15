# House/Mess Finder & Comparison Tracker

A personal web app to track and compare rental listings (houses, sublets, mess seats, flats) found on Facebook/WhatsApp.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/house-finder run dev` — run the frontend (port 25110)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Shadcn/ui (teal/blue theme)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Object Storage: Replit App Storage (GCS-backed presigned URL uploads)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/listings.ts` — Drizzle schema for listings table
- `artifacts/api-server/src/routes/listings.ts` — Listings CRUD routes
- `artifacts/api-server/src/routes/storage.ts` — Image upload/serve routes
- `artifacts/house-finder/src/pages/` — Frontend pages (Dashboard, NewListing, ListingDetail, Compare)
- `artifacts/house-finder/src/lib/compare-context.tsx` — Compare state (up to 4 listings)

## Architecture decisions

- OpenAPI-first: All types generated from `lib/api-spec/openapi.yaml` via Orval
- Image uploads use GCS presigned URLs — client uploads directly to GCS, server only handles metadata
- Compare state lives in React context (not persisted) — up to 4 listings at a time
- Rent stored as `numeric` in Postgres, converted to `number` in route handlers
- JSONB columns for `bills` and `contactInfo` to allow flexible schema

## Product

- Dashboard with listing cards, category filter, sort by rent/distance/newest
- Stats bar showing total listings, avg/min/max rent
- Add listing form with multi-image upload, pros/cons tag inputs, bills breakdown
- Side-by-side comparison table for up to 4 listings
- Listing detail with image lightbox, share-to-clipboard button, map link
- Delete listings from dashboard or detail page

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Always run `pnpm --filter @workspace/db run push` after changing the Drizzle schema
- Rent is stored as `numeric` in DB — always call `Number(row.rent)` in route handlers
- Object storage bucket is auto-authenticated via Replit sidecar — don't modify `objectStorage.ts` GCS client setup

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
