import {
  pgTable,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tuitionsTable = pgTable("tuitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  // Basic Info & Dates
  appliedDate: timestamp("applied_date", { withTimezone: false }),
  tuitionCode: text("tuition_code"),
  studentClass: text("student_class").notNull(),
  medium: text("medium").notNull(),

  // subjects
  subjects: text("subjects").array().notNull().default([]),

  // Location & Logistics
  location: text("location").notNull(),
  distanceFromVarsity: text("distance_from_varsity"),
  daysPerWeek: integer("days_per_week").notNull(),
  timeSlot: text("time_slot"),

  // Financials
  salary: numeric("salary", { precision: 12, scale: 2 }).notNull(),
  conveyanceCost: numeric("conveyance_cost", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  isAdvancePaid: boolean("is_advance_paid").notNull().default(false),

  // Formula helper
  sessionDurationHours: numeric("session_duration_hours", {
    precision: 6,
    scale: 2,
  })
    .notNull()
    .default("1"),

  // Requirements & Contact
  studentGender: text("student_gender"),
  otherRequirements: text("other_requirements"),
  contactInfo: text("contact_info"),

  // Status
  matchingStatus: text("matching_status").notNull().default("Talking/Applied"),
});

export const insertTuitionSchema = createInsertSchema(tuitionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertTuition = z.infer<typeof insertTuitionSchema>;
export type Tuition = typeof tuitionsTable.$inferSelect;

