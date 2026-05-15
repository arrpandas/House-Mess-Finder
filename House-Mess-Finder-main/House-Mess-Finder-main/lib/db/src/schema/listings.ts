import {
  pgTable,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  rent: numeric("rent", { precision: 10, scale: 2 }).notNull(),
  isNegotiable: boolean("is_negotiable").notNull().default(false),
  bills: jsonb("bills").notNull().default({}),
  bathroom: text("bathroom").notNull(),
  roommates: integer("roommates"),
  distance: text("distance"),
  floor: integer("floor"),
  hasLift: boolean("has_lift").notNull().default(false),
  hasBalcony: boolean("has_balcony").notNull().default(false),
  hasChadAccess: boolean("has_chad_access").notNull().default(false),
  hasGuestAccess: boolean("has_guest_access").notNull().default(false),
  serviceCharge: numeric("service_charge", { precision: 10, scale: 2 }),
  hasGenerator: boolean("has_generator").notNull().default(false),
  hasParking: boolean("has_parking").notNull().default(false),
  hasSecurity: boolean("has_security").notNull().default(false),
  hasFridge: boolean("has_fridge").notNull().default(false),
  hasAc: boolean("has_ac").notNull().default(false),
  hasGeyser: boolean("has_geyser").notNull().default(false),
  hasCctv: boolean("has_cctv").notNull().default(false),
  hasMealSystem: boolean("has_meal_system").notNull().default(false),
  timeLimit: text("time_limit"),
  furnished: text("furnished"),
  pros: text("pros").array().notNull().default([]),
  cons: text("cons").array().notNull().default([]),
  images: text("images").array().notNull().default([]),
  videos: text("videos").array().notNull().default([]),
  contactInfo: jsonb("contact_info").notNull(),
  googleMapUrl: text("google_map_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
