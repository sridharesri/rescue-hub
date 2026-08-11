import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const severity = z.enum(["CRITICAL", "HIGH", "MODERATE", "LOW"]);

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadProfile } = await import("./workspace.server");
    const email = (context.claims as { email?: string } | null)?.email ?? null;
    return loadProfile(context.supabase as never, context.userId, email);
  });

export const submitReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().min(4).max(140),
        type: z.string().min(2).max(60),
        description: z.string().min(10).max(2000),
        severity,
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        area: z.string().min(2).max(140),
        affected_estimate: z.number().int().min(0).max(10_000_000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { insertReport } = await import("./workspace.server");
    const email = (context.claims as { email?: string } | null)?.email ?? null;
    return insertReport(context.supabase as never, context.userId, email, data);
  });

export const getMyReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listMyReports } = await import("./workspace.server");
    return listMyReports(context.supabase as never, context.userId);
  });

export const getAllReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listAllReports } = await import("./workspace.server");
    return listAllReports(context.supabase as never);
  });

export const reviewReportFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["VERIFIED", "REJECTED"]),
        note: z.string().max(1000).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { reviewReport } = await import("./workspace.server");
    const email = (context.claims as { email?: string } | null)?.email ?? null;
    return reviewReport(context.supabase as never, context.userId, email, data);
  });

export const updateDisasterFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["REPORTED", "VERIFIED", "ACTIVE", "CONTAINED", "RESOLVED"]),
        severity,
        note: z.string().max(1000).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { updateDisasterState } = await import("./workspace.server");
    const email = (context.claims as { email?: string } | null)?.email ?? null;
    await updateDisasterState(context.supabase as never, context.userId, email, data);
    return { ok: true };
  });

export const updateShelterFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        occupancy: z.number().int().min(0),
        status: z.string().min(2).max(40),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { updateShelterOccupancy } = await import("./workspace.server");
    await updateShelterOccupancy(context.supabase as never, data);
    return { ok: true };
  });

export const updateHospitalFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), available_beds: z.number().int().min(0) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { updateHospitalBeds } = await import("./workspace.server");
    await updateHospitalBeds(context.supabase as never, data);
    return { ok: true };
  });

export const publishAlertFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        headline: z.string().min(4).max(160),
        message: z.string().min(10).max(2000),
        severity,
        area: z.string().min(2).max(140),
        disaster_id: z.string().uuid().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { publishAlert } = await import("./workspace.server");
    const email = (context.claims as { email?: string } | null)?.email ?? null;
    await publishAlert(context.supabase as never, email, data);
    return { ok: true };
  });
