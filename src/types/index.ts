/** Shared domain types. Extended as later phases land. */

export type Severity = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

export type DisasterStatus = "REPORTED" | "VERIFIED" | "ACTIVE" | "CONTAINED" | "RESOLVED";

export type RescueStatus =
  | "AVAILABLE"
  | "DISPATCHED"
  | "ON_THE_WAY"
  | "ON_SITE"
  | "RESCUING"
  | "COMPLETED";

export type UserRole = "CITIZEN" | "AUTHORITY" | "ADMIN" | "NGO" | "RESCUE_TEAM" | "VOLUNTEER";

export type AsyncState = "idle" | "loading" | "success" | "empty" | "error";
