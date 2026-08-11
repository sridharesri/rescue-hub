import type { Severity } from "@/types";

export type RoleName = "citizen" | "responder" | "admin";

export type WorkspaceProfile = {
  userId: string;
  email: string | null;
  roles: RoleName[];
  role: RoleName;
};

export type ReportStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type DisasterReport = {
  id: string;
  reporter_id: string;
  reporter_email: string | null;
  title: string;
  type: string;
  description: string;
  severity: Severity;
  latitude: number;
  longitude: number;
  area: string;
  affected_estimate: number;
  status: ReportStatus;
  review_note: string | null;
  reviewed_at: string | null;
  disaster_id: string | null;
  created_at: string;
};
