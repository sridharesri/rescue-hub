import type { SupabaseClient } from "@supabase/supabase-js";

export type RoleName = "citizen" | "responder" | "admin";

export type TeamMember = {
  user_id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: RoleName[];
};

type Client = SupabaseClient;

/** Throws unless the caller holds the admin role (checked as the caller, RLS on). */
export async function assertAdmin(supabase: Client, userId: string): Promise<void> {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Administrator access required");
}

export async function listTeam(): Promise<TeamMember[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ data: users, error: usersError }, { data: roles, error: rolesError }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    supabaseAdmin.from("user_roles").select("user_id, role"),
  ]);

  if (usersError) throw new Error(usersError.message);
  if (rolesError) throw new Error(rolesError.message);

  const byUser = new Map<string, RoleName[]>();
  for (const row of roles ?? []) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row.role as RoleName);
    byUser.set(row.user_id, list);
  }

  return (users?.users ?? [])
    .map((user) => ({
      user_id: user.id,
      email: user.email ?? "(no email)",
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at ?? null,
      roles: (byUser.get(user.id) ?? ["citizen"]).sort(),
    }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function grantRole(userId: string, role: RoleName): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
  if (error) throw new Error(error.message);
}

export async function revokeRole(
  actorId: string,
  userId: string,
  role: RoleName,
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  if (role === "admin") {
    if (actorId === userId) throw new Error("You cannot remove your own administrator role");
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) <= 1) throw new Error("At least one administrator must remain");
  }

  const { error } = await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", role);
  if (error) throw new Error(error.message);
}
