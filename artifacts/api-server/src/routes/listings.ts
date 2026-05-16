import { Router, type IRouter } from "express";
import { eq, asc, desc, lte, sql } from "drizzle-orm";
import { db, listingsTable } from "@workspace/db";
import {
  ListListingsQueryParams,
  CreateListingBody,
  GetListingParams,
  UpdateListingParams,
  UpdateListingBody,
  DeleteListingParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/listings/summary", async (req, res): Promise<void> => {
  const rows = await db.select().from(listingsTable);
  const total = rows.length;
  const rents = rows.map((r) => Number(r.rent));
  const avgRent = total > 0 ? rents.reduce((a, b) => a + b, 0) / total : null;
  const minRent = total > 0 ? Math.min(...rents) : null;
  const maxRent = total > 0 ? Math.max(...rents) : null;

  const catMap: Record<string, number> = {};
  for (const row of rows) {
    catMap[row.category] = (catMap[row.category] ?? 0) + 1;
  }
  const byCategory = Object.entries(catMap).map(([category, count]) => ({
    category,
    count,
  }));

  res.json({ total, avgRent, minRent, maxRent, byCategory });
});

router.get("/listings", async (req, res): Promise<void> => {
  const params = ListListingsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { category, sortBy, maxRent } = params.data;

  let query = db.select().from(listingsTable).$dynamic();

  if (category) {
    query = query.where(eq(listingsTable.category, category));
  }

  if (maxRent != null) {
    query = query.where(lte(listingsTable.rent, String(maxRent)));
  }

  if (sortBy === "rent_asc") {
    query = query.orderBy(asc(sql`${listingsTable.rent}::numeric`));
  } else if (sortBy === "rent_desc") {
    query = query.orderBy(desc(sql`${listingsTable.rent}::numeric`));
  } else if (sortBy === "distance") {
    query = query.orderBy(asc(listingsTable.distance));
  } else {
    query = query.orderBy(desc(listingsTable.createdAt));
  }

  const rows = await query;

  const listings = rows.map((r) => ({
    ...r,
    rent: Number(r.rent),
    bills: r.bills as Record<string, number>,
    contactInfo: r.contactInfo as { name: string; mobile: string },
    pros: r.pros ?? [],
    cons: r.cons ?? [],
    images: r.images ?? [],
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(listings);
});

router.post("/listings", async (req, res): Promise<void> => {
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    location,
    category,
    rent,
    isNegotiable,
    bills,
    bathroom,
    roommates,
    distance,
    floor,
    advanceDeposit,
    availableFrom,
    hasLift,
    hasBalcony,
    hasChadAccess,
    hasGuestAccess,
    timeLimit,
    furnished,
    pros,
    cons,
    images,
    contactInfo,
    googleMapUrl,
  } = parsed.data;

  const [row] = await db
    .insert(listingsTable)
    .values({
      location,
      category,
      rent: String(rent),
      isNegotiable: isNegotiable ?? false,
      bills: bills ?? {},
      bathroom,
      roommates: roommates ?? null,
      distance: distance ?? null,
      floor: floor ?? null,
      advanceDeposit: advanceDeposit ?? null,
      availableFrom: availableFrom ?? null,
      hasLift: hasLift ?? false,
      hasBalcony: hasBalcony ?? false,
      hasChadAccess: hasChadAccess ?? false,
      hasGuestAccess: hasGuestAccess ?? false,
      timeLimit: timeLimit ?? null,
      furnished: furnished ?? null,
      pros: pros ?? [],
      cons: cons ?? [],
      images: images ?? [],
      contactInfo: contactInfo as Record<string, string>,
      googleMapUrl: googleMapUrl ?? null,
    })
    .returning();

  res.status(201).json({
    ...row,
    rent: Number(row.rent),
    bills: row.bills as Record<string, number>,
    contactInfo: row.contactInfo as { name: string; mobile: string },
    pros: row.pros ?? [],
    cons: row.cons ?? [],
    images: row.images ?? [],
    createdAt: row.createdAt.toISOString(),
  });
});

router.get("/listings/:id", async (req, res): Promise<void> => {
  const params = GetListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  res.json({
    ...row,
    rent: Number(row.rent),
    bills: row.bills as Record<string, number>,
    contactInfo: row.contactInfo as { name: string; mobile: string },
    pros: row.pros ?? [],
    cons: row.cons ?? [],
    images: row.images ?? [],
    createdAt: row.createdAt.toISOString(),
  });
});

router.patch("/listings/:id", async (req, res): Promise<void> => {
  const params = UpdateListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.location !== undefined) updates.location = d.location;
  if (d.category !== undefined) updates.category = d.category;
  if (d.rent !== undefined) updates.rent = String(d.rent);
  if (d.isNegotiable !== undefined) updates.isNegotiable = d.isNegotiable;
  if (d.bills !== undefined) updates.bills = d.bills;
  if (d.bathroom !== undefined) updates.bathroom = d.bathroom;
  if (d.roommates !== undefined) updates.roommates = d.roommates;
  if (d.distance !== undefined) updates.distance = d.distance;
  if (d.floor !== undefined) updates.floor = d.floor;
  if (d.advanceDeposit !== undefined) updates.advanceDeposit = d.advanceDeposit;
  if (d.availableFrom !== undefined) updates.availableFrom = d.availableFrom;
  if (d.hasLift !== undefined) updates.hasLift = d.hasLift;
  if (d.hasBalcony !== undefined) updates.hasBalcony = d.hasBalcony;
  if (d.hasChadAccess !== undefined) updates.hasChadAccess = d.hasChadAccess;
  if (d.hasGuestAccess !== undefined) updates.hasGuestAccess = d.hasGuestAccess;
  if (d.timeLimit !== undefined) updates.timeLimit = d.timeLimit;
  if (d.furnished !== undefined) updates.furnished = d.furnished;
  if (d.pros !== undefined) updates.pros = d.pros;
  if (d.cons !== undefined) updates.cons = d.cons;
  if (d.images !== undefined) updates.images = d.images;
  if (d.contactInfo !== undefined) updates.contactInfo = d.contactInfo;
  if (d.googleMapUrl !== undefined) updates.googleMapUrl = d.googleMapUrl;

  const [row] = await db
    .update(listingsTable)
    .set(updates)
    .where(eq(listingsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  res.json({
    ...row,
    rent: Number(row.rent),
    bills: row.bills as Record<string, number>,
    contactInfo: row.contactInfo as { name: string; mobile: string },
    pros: row.pros ?? [],
    cons: row.cons ?? [],
    images: row.images ?? [],
    createdAt: row.createdAt.toISOString(),
  });
});

router.delete("/listings/:id", async (req, res): Promise<void> => {
  const params = DeleteListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(listingsTable)
    .where(eq(listingsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
