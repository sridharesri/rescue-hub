import type { DisasterStatus, Severity } from "@/types";

export type Disaster = {
  id: string;
  title: string;
  type: string;
  description: string;
  severity: Severity;
  status: DisasterStatus;
  latitude: number;
  longitude: number;
  area: string;
  affected_people: number;
  occurred_at: string;
  resolved_at: string | null;
};

export type Alert = {
  id: string;
  disaster_id: string | null;
  headline: string;
  message: string;
  severity: Severity;
  area: string;
  issued_by: string;
  issued_at: string;
  expires_at: string | null;
};

export type Shelter = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupancy: number;
  facilities: string[];
  contact_phone: string | null;
  status: string;
};

export type Hospital = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  total_beds: number;
  available_beds: number;
  emergency_capable: boolean;
  specialities: string[];
  contact_phone: string | null;
};

export type Ngo = {
  id: string;
  name: string;
  description: string;
  focus_areas: string[];
  coverage_area: string;
  verified: boolean;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
};

export type OverviewStats = {
  activeDisasters: number;
  criticalDisasters: number;
  liveAlerts: number;
  shelterCapacity: number;
  shelterOccupancy: number;
  availableBeds: number;
  peopleAffected: number;
};
