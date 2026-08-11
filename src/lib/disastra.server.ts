import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Alert, Disaster, Hospital, Ngo, OverviewStats, Shelter } from "@/types/records";

function getPublicClient() {
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

const DISASTER_COLUMNS =
  "id, title, type, description, severity, status, latitude, longitude, area, affected_people, occurred_at, resolved_at";
const ALERT_COLUMNS =
  "id, disaster_id, headline, message, severity, area, issued_by, issued_at, expires_at";
const SHELTER_COLUMNS =
  "id, name, address, latitude, longitude, capacity, occupancy, facilities, contact_phone, status";
const HOSPITAL_COLUMNS =
  "id, name, address, latitude, longitude, total_beds, available_beds, emergency_capable, specialities, contact_phone";
const NGO_COLUMNS =
  "id, name, description, focus_areas, coverage_area, verified, contact_phone, contact_email, website";

const ARCHIVE_STATUSES = ["RESOLVED"] as const;

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as T;
}

export async function fetchDisasters(options?: { archived?: boolean }): Promise<Disaster[]> {
  const supabase = getPublicClient();
  let query = supabase.from("disasters").select(DISASTER_COLUMNS);
  query = options?.archived
    ? query.in("status", [...ARCHIVE_STATUSES])
    : query.not("status", "in", "(RESOLVED)");
  const result = await query.order("occurred_at", { ascending: false });
  return unwrap<Disaster[]>(result as never);
}

export async function fetchAllDisasters(): Promise<Disaster[]> {
  const supabase = getPublicClient();
  const result = await supabase
    .from("disasters")
    .select(DISASTER_COLUMNS)
    .order("occurred_at", { ascending: false });
  return unwrap<Disaster[]>(result as never);
}

export async function fetchDisaster(id: string): Promise<{
  disaster: Disaster | null;
  alerts: Alert[];
  shelters: Shelter[];
  hospitals: Hospital[];
}> {
  const supabase = getPublicClient();
  const disasterResult = await supabase
    .from("disasters")
    .select(DISASTER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (disasterResult.error) throw new Error(disasterResult.error.message);
  const disaster = (disasterResult.data ?? null) as Disaster | null;
  if (!disaster) return { disaster: null, alerts: [], shelters: [], hospitals: [] };

  const [alerts, shelters, hospitals] = await Promise.all([
    supabase
      .from("alerts")
      .select(ALERT_COLUMNS)
      .eq("disaster_id", id)
      .order("issued_at", { ascending: false }),
    supabase.from("shelters").select(SHELTER_COLUMNS),
    supabase.from("hospitals").select(HOSPITAL_COLUMNS),
  ]);

  const near = <T extends { latitude: number; longitude: number }>(rows: T[]) =>
    rows
      .map((row) => ({
        row,
        distance: Math.hypot(row.latitude - disaster.latitude, row.longitude - disaster.longitude),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map((entry) => entry.row);

  return {
    disaster,
    alerts: unwrap<Alert[]>(alerts as never),
    shelters: near(unwrap<Shelter[]>(shelters as never)),
    hospitals: near(unwrap<Hospital[]>(hospitals as never)),
  };
}

export async function fetchAlerts(): Promise<Alert[]> {
  const supabase = getPublicClient();
  const result = await supabase
    .from("alerts")
    .select(ALERT_COLUMNS)
    .order("issued_at", { ascending: false });
  return unwrap<Alert[]>(result as never);
}

export async function fetchShelters(): Promise<Shelter[]> {
  const supabase = getPublicClient();
  const result = await supabase.from("shelters").select(SHELTER_COLUMNS).order("name");
  return unwrap<Shelter[]>(result as never);
}

export async function fetchHospitals(): Promise<Hospital[]> {
  const supabase = getPublicClient();
  const result = await supabase.from("hospitals").select(HOSPITAL_COLUMNS).order("name");
  return unwrap<Hospital[]>(result as never);
}

export async function fetchNgos(): Promise<Ngo[]> {
  const supabase = getPublicClient();
  const result = await supabase
    .from("ngos")
    .select(NGO_COLUMNS)
    .order("verified", { ascending: false })
    .order("name");
  return unwrap<Ngo[]>(result as never);
}

export async function fetchMapData(): Promise<{
  disasters: Disaster[];
  shelters: Shelter[];
  hospitals: Hospital[];
}> {
  const [disasters, shelters, hospitals] = await Promise.all([
    fetchAllDisasters(),
    fetchShelters(),
    fetchHospitals(),
  ]);
  return { disasters, shelters, hospitals };
}

export async function fetchOverview(): Promise<{ stats: OverviewStats; latest: Disaster[] }> {
  const [disasters, alerts, shelters, hospitals] = await Promise.all([
    fetchAllDisasters(),
    fetchAlerts(),
    fetchShelters(),
    fetchHospitals(),
  ]);

  const live = disasters.filter((item) => item.status !== "RESOLVED");
  const now = Date.now();

  return {
    stats: {
      activeDisasters: live.length,
      criticalDisasters: live.filter((item) => item.severity === "CRITICAL").length,
      liveAlerts: alerts.filter(
        (alert) => !alert.expires_at || new Date(alert.expires_at).getTime() > now,
      ).length,
      shelterCapacity: shelters.reduce((total, item) => total + item.capacity, 0),
      shelterOccupancy: shelters.reduce((total, item) => total + item.occupancy, 0),
      availableBeds: hospitals.reduce((total, item) => total + item.available_beds, 0),
      peopleAffected: live.reduce((total, item) => total + item.affected_people, 0),
    },
    latest: live.slice(0, 4),
  };
}
