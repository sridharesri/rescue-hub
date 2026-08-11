import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, Bell, Loader2, Siren } from "lucide-react";

import { AppLayout } from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TextAreaField, TextField } from "@/components/common/form-field";
import { SeverityBadge, StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { CardSkeleton, ListSkeleton, TableSkeleton } from "@/components/common/loading-skeletons";
import type { DisasterStatus, RescueStatus, Severity } from "@/types";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: "Design System — DISASTRA" },
      {
        name: "description",
        content:
          "Reference page for DISASTRA design tokens, buttons, cards, forms, badges, modals, toasts and UI states.",
      },
      { property: "og:title", content: "Design System — DISASTRA" },
      { property: "og:description", content: "DISASTRA component and token reference." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DesignSystemPage,
});

const SEVERITIES: Severity[] = ["CRITICAL", "HIGH", "MODERATE", "LOW"];
const STATUSES: (DisasterStatus | RescueStatus)[] = [
  "REPORTED",
  "VERIFIED",
  "ACTIVE",
  "CONTAINED",
  "RESOLVED",
  "AVAILABLE",
  "DISPATCHED",
  "ON_THE_WAY",
  "ON_SITE",
  "RESCUING",
  "COMPLETED",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="eyebrow text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function DesignSystemPage() {
  return (
    <AppLayout title="Design System">
      <div className="mx-auto max-w-5xl space-y-12 pb-16">
        <header>
          <p className="eyebrow text-primary">Phase 1 reference</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Design system</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every shared primitive and UI state used across DISASTRA. All values come from semantic
            tokens, so both themes stay in sync.
          </p>
        </header>

        <Section title="Color tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Primary", "bg-primary text-primary-foreground"],
              ["Critical", "bg-critical text-critical-foreground"],
              ["High", "bg-high text-high-foreground"],
              ["Moderate", "bg-moderate text-moderate-foreground"],
              ["Low", "bg-low text-low-foreground"],
              ["Resolved", "bg-resolved text-resolved-foreground"],
              ["Info", "bg-info text-info-foreground"],
              ["Muted", "bg-muted text-muted-foreground"],
            ].map(([name, cls]) => (
              <div key={name} className={`rounded-lg p-4 text-xs font-semibold uppercase ${cls}`}>
                {name}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="emergency">
              <Siren aria-hidden="true" />
              Report disaster
            </Button>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="safe">Mark safe</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
            <Button disabled>
              <Loader2 aria-hidden="true" className="animate-spin" />
              Submitting
            </Button>
          </div>
        </Section>

        <Section title="Status badges">
          <div className="flex flex-wrap gap-2">
            {SEVERITIES.map((s) => (
              <SeverityBadge key={s} severity={s} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Incident summary</CardTitle>
                <CardDescription>Structure used for incident and resource cards.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Content area. Cards inherit surface, border and radius tokens.
              </CardContent>
            </Card>
            <Card className="border-critical/40">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-critical/15 text-critical">
                  <AlertTriangle aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <CardTitle className="truncate">Critical variant</CardTitle>
                  <CardDescription>Emphasis for life-safety content.</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </Section>

        <Section title="Form fields">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <TextField id="ds-title" label="Incident title" required placeholder="Short summary" />
            <TextField
              id="ds-location"
              label="Location"
              hint="Use GPS or type an address."
              placeholder="Area, city"
            />
            <TextField
              id="ds-contact"
              label="Contact number"
              error="Enter a valid phone number."
              defaultValue="12"
            />
            <TextAreaField
              id="ds-notes"
              label="Description"
              className="sm:col-span-2"
              placeholder="What is happening on the ground?"
              rows={4}
            />
          </form>
        </Section>

        <Section title="Modal and toasts">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open modal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm dispatch request</DialogTitle>
                  <DialogDescription>
                    AI Recommendation — Human Authority Makes Final Decision.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="emergency">Confirm</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="secondary" onClick={() => toast.success("Report submitted")}>
              Success toast
            </Button>
            <Button variant="secondary" onClick={() => toast.error("Upload failed")}>
              Error toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast("Alert issued", { description: "Coastal zone 3 — evacuate now", icon: <Bell className="size-4" /> })}
            >
              Info toast
            </Button>
          </div>
        </Section>

        <Section title="Loading states">
          <div className="grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <ListSkeleton rows={1} />
          </div>
          <TableSkeleton />
        </Section>

        <Section title="Empty and error states">
          <div className="grid gap-4 lg:grid-cols-2">
            <EmptyState
              title="No active disasters"
              description="Nothing is currently reported in this region."
            />
            <ErrorState onRetry={() => toast("Retrying…")} />
          </div>
        </Section>
      </div>
    </AppLayout>
  );
}
