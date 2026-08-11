import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { RescueStatus } from "@/types";
import type { RescueTeam, RescueTeamUpdate } from "@/types/rescue";
import { RESCUE_TRANSITIONS } from "@/types/rescue";

type Client = SupabaseClient<Database>;

const TEAM_COLUMNS =
  "id, name, organisation, base_area, capabilities, members, contact_phone, available, status, disaster_id, notes, created_at, updated_at";
const UPDATE_COLUMNS = "id, team_id, author_email, status, disaster_id, note, created_at";

function getPublicClient(): Client {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export async function fetchRescueTeams(): Promise<RescueTeam[]> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("rescue_teams")
    .select(TEAM_COLUMNS)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RescueTeam[];
}

export async function fetchRescueTeamUpdates(teamId: string): Promise<RescueTeamUpdate[]> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("rescue_team_updates")
    .select(UPDATE_COLUMNS)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RescueTeamUpdate[];
}

export async function insertRescueTeam(
  supabase: Client,
  input: {
    name: string;
    organisation: string;
    base_area: string;
    capabilities: string[];
    members: number;
    contact_phone: string | null;
    notes: string;
  },
): Promise<RescueTeam> {
  const { data, error } = await supabase
    .from("rescue_teams")
    .insert(input as never)
    .select(TEAM_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as RescueTeam;
}

export async function setRescueTeamAvailability(
  supabase: Client,
  input: { id: string; available: boolean },
): Promise<void> {
  const { error } = await supabase
    .from("rescue_teams")
    .update({ available: input.available } as never)
    .eq("id", input.id);
  if (error) throw new Error(error.message);
}

export async function advanceRescueTeam(
  supabase: Client,
  userId: string,
  email: string | null,
  input: { id: string; status: RescueStatus; disaster_id: string | null; note: string },
): Promise<void> {
  const { data: current, error: readError } = await supabase
    .from("rescue_teams")
    .select("id, status, disaster_id")
    .eq("id", input.id)
    .maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!current) throw new Error("Rescue team not found");

  const from = (current as { status: RescueStatus }).status;
  if (from !== input.status && !RESCUE_TRANSITIONS[from].includes(input.status)) {
    throw new Error(`Cannot move a team from ${from} to ${input.status}`);
  }

  const active = input.status !== "AVAILABLE" && input.status !== "COMPLETED";
  const disasterId =
    input.status === "AVAILABLE"
      ? null
      : (input.disaster_id ?? (current as { disaster_id: string | null }).disaster_id);

  if (active && !disasterId) throw new Error("Assign an incident before dispatching this team");

  const { error } = await supabase
    .from("rescue_teams")
    .update({ status: input.status, disaster_id: disasterId, available: !active } as never)
    .eq("id", input.id);
  if (error) throw new Error(error.message);

  const { error: logError } = await supabase.from("rescue_team_updates").insert({
    team_id: input.id,
    author_id: userId,
    author_email: email,
    status: input.status,
    disaster_id: disasterId,
    note: input.note,
  } as never);
  if (logError) throw new Error(logError.message);
}
