import type { RescueStatus } from "@/types";

export const RESCUE_STATUSES: RescueStatus[] = [
  "AVAILABLE",
  "DISPATCHED",
  "ON_THE_WAY",
  "ON_SITE",
  "RESCUING",
  "COMPLETED",
];

/** Allowed forward transitions for a rescue team's lifecycle. */
export const RESCUE_TRANSITIONS: Record<RescueStatus, RescueStatus[]> = {
  AVAILABLE: ["DISPATCHED"],
  DISPATCHED: ["ON_THE_WAY", "AVAILABLE"],
  ON_THE_WAY: ["ON_SITE", "AVAILABLE"],
  ON_SITE: ["RESCUING", "AVAILABLE"],
  RESCUING: ["COMPLETED"],
  COMPLETED: ["AVAILABLE"],
};

export type RescueTeam = {
  id: string;
  name: string;
  organisation: string;
  base_area: string;
  capabilities: string[];
  members: number;
  contact_phone: string | null;
  available: boolean;
  status: RescueStatus;
  disaster_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type RescueTeamUpdate = {
  id: string;
  team_id: string;
  author_email: string | null;
  status: RescueStatus;
  disaster_id: string | null;
  note: string;
  created_at: string;
};
