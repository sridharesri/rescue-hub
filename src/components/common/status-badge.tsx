import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { DisasterStatus, RescueStatus, Severity } from "@/types";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
  {
    variants: {
      tone: {
        critical: "border-critical/40 bg-critical/15 text-critical",
        high: "border-high/40 bg-high/15 text-high",
        moderate: "border-moderate/50 bg-moderate/20 text-moderate",
        low: "border-low/40 bg-low/15 text-low",
        resolved: "border-resolved/40 bg-resolved/15 text-resolved",
        info: "border-info/40 bg-info/15 text-info",
        neutral: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type StatusTone = NonNullable<VariantProps<typeof statusBadgeVariants>["tone"]>;

const SEVERITY_TONE: Record<Severity, StatusTone> = {
  CRITICAL: "critical",
  HIGH: "high",
  MODERATE: "moderate",
  LOW: "low",
};

const STATUS_TONE: Record<DisasterStatus | RescueStatus, StatusTone> = {
  REPORTED: "neutral",
  VERIFIED: "info",
  ACTIVE: "critical",
  CONTAINED: "high",
  RESOLVED: "resolved",
  AVAILABLE: "resolved",
  DISPATCHED: "info",
  ON_THE_WAY: "info",
  ON_SITE: "high",
  RESCUING: "critical",
  COMPLETED: "resolved",
};

function label(value: string) {
  return value.replace(/_/g, " ");
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={cn(statusBadgeVariants({ tone: SEVERITY_TONE[severity] }), className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label(severity)}
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: DisasterStatus | RescueStatus;
  className?: string;
}) {
  return (
    <span className={cn(statusBadgeVariants({ tone: STATUS_TONE[status] }), className)}>
      {label(status)}
    </span>
  );
}

export { statusBadgeVariants };
