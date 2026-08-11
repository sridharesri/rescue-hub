import type { Alert, Disaster, Hospital, Shelter } from "@/types/records";

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function relativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (Math.abs(minutes) < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}

export function isAlertLive(alert: Alert) {
  return !alert.expires_at || new Date(alert.expires_at).getTime() > Date.now();
}

export function occupancyRatio(shelter: Shelter) {
  if (shelter.capacity <= 0) return 0;
  return Math.min(1, shelter.occupancy / shelter.capacity);
}

export function bedRatio(hospital: Hospital) {
  if (hospital.total_beds <= 0) return 0;
  return Math.min(1, hospital.available_beds / hospital.total_beds);
}

export function severityRank(disaster: Disaster) {
  return { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 }[disaster.severity];
}

export const SEVERITY_HEX: Record<Disaster["severity"], string> = {
  CRITICAL: "#c62828",
  HIGH: "#e07a1f",
  MODERATE: "#e0b32a",
  LOW: "#3aa3c9",
};
