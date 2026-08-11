import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const roleName = z.enum(["citizen", "responder", "admin"]);

export const getTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, listTeam } = await import("./admin.server");
    await assertAdmin(context.supabase as never, context.userId);
    return listTeam();
  });

export const grantRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ user_id: z.string().uuid(), role: roleName }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, grantRole } = await import("./admin.server");
    await assertAdmin(context.supabase as never, context.userId);
    await grantRole(data.user_id, data.role);
    return { ok: true };
  });

export const revokeRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ user_id: z.string().uuid(), role: roleName }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, revokeRole } = await import("./admin.server");
    await assertAdmin(context.supabase as never, context.userId);
    await revokeRole(context.userId, data.user_id, data.role);
    return { ok: true };
  });
