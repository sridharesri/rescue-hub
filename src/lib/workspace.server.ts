import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { DisasterReport, RoleName, WorkspaceProfile } from "@/types/workspace";

type Client = SupabaseClient<Database>;

const REPORT_COLUMNS =
  "id, reporter_id, reporter_email, title, type, description, severity, latitude, longitude, area, affected_estimate, status, review_note, reviewed_at, disaster_id, created_at";

function rank(roles: RoleName[]): RoleName {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("responder")) return "responder";
  return "citizen";
}

export async function loadProfile(
  supabase: Client,
  userId: string,
  email: string | null,
): Promise<WorkspaceProfile> {
  // Ensures the signed-in account has at least the citizen role.
  await (supabase as unknown as { rpc: (fn: string) => Promise<unknown> }).rpc(
    "bootstrap_my_role",
  );

  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);

  const roles = (data ?? []).map((row) => row.role as RoleName);
  return {
    userId,
    email,
    roles: roles.length ? roles : ["citizen"],
    role: rank(roles.length ? roles : ["citizen"]),
  };
}

export async function insertReport(
  supabase: Client,
  userId: string,
  email: string | null,
  input: {
    title: string;
    type: string;
    description: string;
    severity: string;
    latitude: number;
    longitude: number;
    area: string;
    affected_estimate: number;
  },
): Promise<DisasterReport> {
  const { data, error } = await supabase
    .from("disaster_reports")
    .insert({ ...input, reporter_id: userId, reporter_email: email } as never)
    .select(REPORT_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as DisasterReport;
}

export async function listMyReports(supabase: Client, userId: string): Promise<DisasterReport[]> {
  const { data, error } = await supabase
    .from("disaster_reports")
    .select(REPORT_COLUMNS)
    .eq("reporter_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as DisasterReport[];
}

export async function listAllReports(supabase: Client): Promise<DisasterReport[]> {
  const { data, error } = await supabase
    .from("disaster_reports")
    .select(REPORT_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as DisasterReport[];
}

export async function reviewReport(
  supabase: Client,
  userId: string,
  email: string | null,
  input: { id: string; decision: "VERIFIED" | "REJECTED"; note: string },
): Promise<{ reportId: string; disasterId: string | null }> {
  const { data: report, error: readError } = await supabase
    .from("disaster_reports")
    .select(REPORT_COLUMNS)
    .eq("id", input.id)
    .maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!report) throw new Error("Report not found");

  const row = report as unknown as DisasterReport;
  let disasterId: string | null = row.disaster_id;

  if (input.decision === "VERIFIED" && !disasterId) {
    const { data: created, error: createError } = await supabase
      .from("disasters")
      .insert({
        title: row.title,
        type: row.type,
        description: row.description,
        severity: row.severity,
        status: "VERIFIED",
        latitude: row.latitude,
        longitude: row.longitude,
        area: row.area,
        affected_people: row.affected_estimate,
        occurred_at: row.created_at,
      } as never)
      .select("id")
      .single();
    if (createError) throw new Error(createError.message);
    disasterId = (created as { id: string }).id;

    await supabase.from("disaster_updates").insert({
      disaster_id: disasterId,
      author_id: userId,
      author_email: email,
      status: "VERIFIED",
      severity: row.severity,
      note: `Verified from citizen report. ${input.note}`.trim(),
    } as never);
  }

  const { error: updateError } = await supabase
    .from("disaster_reports")
    .update({
      status: input.decision,
      review_note: input.note,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      disaster_id: disasterId,
    } as never)
    .eq("id", input.id);
  if (updateError) throw new Error(updateError.message);

  return { reportId: input.id, disasterId };
}

export async function updateDisasterState(
  supabase: Client,
  userId: string,
  email: string | null,
  input: { id: string; status: string; severity: string; note: string },
): Promise<void> {
  const patch: Record<string, unknown> = { status: input.status, severity: input.severity };
  if (input.status === "RESOLVED") patch["resolved_at"] = new Date().toISOString();

  const { error } = await supabase.from("disasters").update(patch as never).eq("id", input.id);
  if (error) throw new Error(error.message);

  const { error: logError } = await supabase.from("disaster_updates").insert({
    disaster_id: input.id,
    author_id: userId,
    author_email: email,
    status: input.status,
    severity: input.severity,
    note: input.note,
  } as never);
  if (logError) throw new Error(logError.message);
}

export async function updateShelterOccupancy(
  supabase: Client,
  input: { id: string; occupancy: number; status: string },
): Promise<void> {
  const { error } = await supabase
    .from("shelters")
    .update({ occupancy: input.occupancy, status: input.status } as never)
    .eq("id", input.id);
  if (error) throw new Error(error.message);
}

export async function updateHospitalBeds(
  supabase: Client,
  input: { id: string; available_beds: number },
): Promise<void> {
  const { error } = await supabase
    .from("hospitals")
    .update({ available_beds: input.available_beds } as never)
    .eq("id", input.id);
  if (error) throw new Error(error.message);
}

export async function publishAlert(
  supabase: Client,
  email: string | null,
  input: {
    headline: string;
    message: string;
    severity: string;
    area: string;
    disaster_id: string | null;
  },
): Promise<void> {
  const { error } = await supabase.from("alerts").insert({
    headline: input.headline,
    message: input.message,
    severity: input.severity,
    area: input.area,
    disaster_id: input.disaster_id,
    issued_by: email ?? "DISASTRA Control",
  } as never);
  if (error) throw new Error(error.message);
}
