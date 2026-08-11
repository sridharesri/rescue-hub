import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const rescueStatus = z.enum([
  "AVAILABLE",
  "DISPATCHED",
  "ON_THE_WAY",
  "ON_SITE",
  "RESCUING",
  "COMPLETED",
]);

export const getRescueTeams = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchRescueTeams } = await import("./rescue.server");
  return fetchRescueTeams();
});

export const getRescueTeamUpdates = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ teamId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { fetchRescueTeamUpdates } = await import("./rescue.server");
    return fetchRescueTeamUpdates(data.teamId);
  });

export const createRescueTeamFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(2).max(120),
        organisation: z.string().max(120).default(""),
        base_area: z.string().min(2).max(140),
        capabilities: z.array(z.string().min(1).max(60)).max(12).default([]),
        members: z.number().int().min(0).max(10_000),
        contact_phone: z.string().max(40).nullable().default(null),
        notes: z.string().max(1000).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { insertRescueTeam } = await import("./rescue.server");
    return insertRescueTeam(context.supabase as never, data);
  });

export const setRescueAvailabilityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), available: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { setRescueTeamAvailability } = await import("./rescue.server");
    await setRescueTeamAvailability(context.supabase as never, data);
    return { ok: true };
  });

export const advanceRescueTeamFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: rescueStatus,
        disaster_id: z.string().uuid().nullable().default(null),
        note: z.string().max(1000).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { advanceRescueTeam } = await import("./rescue.server");
    const email = (context.claims as { email?: string } | null)?.email ?? null;
    await advanceRescueTeam(context.supabase as never, context.userId, email, data);
    return { ok: true };
  });
