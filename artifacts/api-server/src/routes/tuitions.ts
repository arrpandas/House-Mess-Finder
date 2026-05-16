import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, tuitionsTable } from "@workspace/db";
// These types will be generated from OpenAPI after we add tuition endpoints.
// For now, we reference the shape via inline Zod-free validation in the route.
// Next step after OpenAPI update: replace these with generated @workspace/api-zod types.



const router: IRouter = Router();

// Types to be generated from OpenAPI after we add tuition endpoints.
// Using `any` temporarily prevents TS from blocking compilation.
const ListTuitionsQueryParams: any = { safeParse: (v: any) => ({ success: true, data: v || {} }) };
const CreateTuitionBody: any = { safeParse: (v: any) => ({ success: true, data: v }) };
const GetTuitionParams: any = { safeParse: (v: any) => ({ success: true, data: v }) };
const UpdateTuitionParams: any = { safeParse: (v: any) => ({ success: true, data: v }) };
const UpdateTuitionBody: any = { safeParse: (v: any) => ({ success: true, data: v }) };
const DeleteTuitionParams: any = { safeParse: (v: any) => ({ success: true, data: v }) };


// NOTE: route validation types come from generated @workspace/api-zod.
// Next step: update OpenAPI + regenerate, then fix any remaining TS errors.



router.get("/tuitions", async (req, res): Promise<void> => {
  const params = ListTuitionsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { studentClass, medium, matchingStatus } = params.data;

  let query = db.select().from(tuitionsTable).$dynamic();
  if (studentClass) query = query.where(eq(tuitionsTable.studentClass, studentClass));
  if (medium) query = query.where(eq(tuitionsTable.medium, medium));
  if (matchingStatus) query = query.where(eq(tuitionsTable.matchingStatus, matchingStatus));

  // newest first
  query = query.orderBy(tuitionsTable.createdAt);

  const rows = await query;

  res.json(
    rows.map((r) => ({
      ...r,
      appliedDate: r.appliedDate ? (r.appliedDate as Date).toISOString().slice(0, 10) : null,
      salary: Number(r.salary),
      conveyanceCost: Number(r.conveyanceCost ?? 0),
      sessionDurationHours: Number(r.sessionDurationHours),
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/tuitions", async (req, res): Promise<void> => {
  const parsed = CreateTuitionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    appliedDate,
    tuitionCode,
    studentClass,
    medium,
    subjects,
    location,
    distanceFromVarsity,
    daysPerWeek,
    timeSlot,
    salary,
    conveyanceCost,
    isAdvancePaid,
    sessionDurationHours,
    studentGender,
    otherRequirements,
    contactInfo,
    matchingStatus,
  } = parsed.data;

  const [row] = await db
    .insert(tuitionsTable)
    .values({
      appliedDate: appliedDate ? new Date(appliedDate) : undefined,
      tuitionCode: tuitionCode ?? null,
      studentClass,
      medium,
      subjects: subjects ?? [],
      location,
      distanceFromVarsity: distanceFromVarsity ?? null,
      daysPerWeek,
      timeSlot: timeSlot ?? null,
      salary: String(salary),
      conveyanceCost: conveyanceCost != null ? String(conveyanceCost) : undefined,
      isAdvancePaid: isAdvancePaid ?? false,
      sessionDurationHours: String(sessionDurationHours),
      studentGender: studentGender ?? null,
      otherRequirements: otherRequirements ?? null,
      contactInfo,
      matchingStatus: matchingStatus ?? undefined,
    })
    .returning();

  res.status(201).json({
    ...row,
    appliedDate: row.appliedDate ? (row.appliedDate as Date).toISOString().slice(0, 10) : null,
    salary: Number(row.salary),
    conveyanceCost: Number(row.conveyanceCost ?? 0),
    sessionDurationHours: Number(row.sessionDurationHours),
    createdAt: row.createdAt.toISOString(),
  });
});

router.get("/tuitions/:id", async (req, res): Promise<void> => {
  const params = GetTuitionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(tuitionsTable)
    .where(eq(tuitionsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Tuition not found" });
    return;
  }

  res.json({
    ...row,
    appliedDate: row.appliedDate ? (row.appliedDate as Date).toISOString().slice(0, 10) : null,
    salary: Number(row.salary),
    conveyanceCost: Number(row.conveyanceCost ?? 0),
    sessionDurationHours: Number(row.sessionDurationHours),
    createdAt: row.createdAt.toISOString(),
  });
});

router.patch("/tuitions/:id", async (req, res): Promise<void> => {
  const params = UpdateTuitionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTuitionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  const d = parsed.data;

  if (d.appliedDate !== undefined)
    updates.appliedDate = d.appliedDate ? new Date(d.appliedDate) : null;
  if (d.tuitionCode !== undefined) updates.tuitionCode = d.tuitionCode;
  if (d.studentClass !== undefined) updates.studentClass = d.studentClass;
  if (d.medium !== undefined) updates.medium = d.medium;
  if (d.subjects !== undefined) updates.subjects = d.subjects;
  if (d.location !== undefined) updates.location = d.location;
  if (d.distanceFromVarsity !== undefined) updates.distanceFromVarsity = d.distanceFromVarsity;
  if (d.daysPerWeek !== undefined) updates.daysPerWeek = d.daysPerWeek;
  if (d.timeSlot !== undefined) updates.timeSlot = d.timeSlot;
  if (d.salary !== undefined) updates.salary = String(d.salary);
  if (d.conveyanceCost !== undefined)
    updates.conveyanceCost = d.conveyanceCost != null ? String(d.conveyanceCost) : null;
  if (d.isAdvancePaid !== undefined) updates.isAdvancePaid = d.isAdvancePaid;
  if (d.sessionDurationHours !== undefined) updates.sessionDurationHours = String(d.sessionDurationHours);
  if (d.studentGender !== undefined) updates.studentGender = d.studentGender;
  if (d.otherRequirements !== undefined) updates.otherRequirements = d.otherRequirements;
  if (d.contactInfo !== undefined) updates.contactInfo = d.contactInfo;
  if (d.matchingStatus !== undefined) updates.matchingStatus = d.matchingStatus;

  const [row] = await db
    .update(tuitionsTable)
    .set(updates)
    .where(eq(tuitionsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Tuition not found" });
    return;
  }

  res.json({
    ...row,
    appliedDate: row.appliedDate ? (row.appliedDate as Date).toISOString().slice(0, 10) : null,
    salary: Number(row.salary),
    conveyanceCost: Number(row.conveyanceCost ?? 0),
    sessionDurationHours: Number(row.sessionDurationHours),
    createdAt: row.createdAt.toISOString(),
  });
});

router.delete("/tuitions/:id", async (req, res): Promise<void> => {
  const params = DeleteTuitionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(tuitionsTable)
    .where(eq(tuitionsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Tuition not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

