import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ShieldX } from "lucide-react";

import { AppLayout } from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextAreaField, TextField } from "@/components/common/form-field";
import { EmptyState } from "@/components/common/empty-state";
import { SeverityBadge } from "@/components/common/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { disastersQuery, hospitalsQuery, sheltersQuery } from "@/lib/queries";
import {
  publishAlertFn,
  updateDisasterFn,
  updateHospitalFn,
  updateShelterFn,
} from "@/lib/workspace.functions";
import type { DisasterStatus, Severity } from "@/types";

const STATUSES: DisasterStatus[] = ["REPORTED", "VERIFIED", "ACTIVE", "CONTAINED", "RESOLVED"];
const SEVERITIES: Severity[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];
const SHELTER_STATUSES = ["OPEN", "FULL", "CLOSED"];

export const Route = createFileRoute("/_authenticated/operations")({
  head: () => ({
    meta: [
      { title: "Operations console — DISASTRA" },
      {
        name: "description",
        content:
          "Update incident status, shelter occupancy and hospital bed availability, and publish emergency alerts.",
      },
      { property: "og:title", content: "Operations console — DISASTRA" },
      {
        property: "og:description",
        content: "Coordinate live disaster response from one console.",
      },
    ],
  }),
  component: OperationsPage,
});

function OperationsPage() {
  const { role, loading } = useAuth();
  const allowed = role === "responder" || role === "admin";

  if (!loading && !allowed) {
    return (
      <AppLayout title="Operations console">
        <EmptyState
          icon={ShieldX}
          title="Responder access required"
          description="Only responders and administrators can change live operational data."
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Operations console">
      <Tabs defaultValue="incidents" className="mx-auto max-w-4xl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="shelters">Shelters</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="incidents" className="mt-4">
          <IncidentsPanel />
        </TabsContent>
        <TabsContent value="shelters" className="mt-4">
          <SheltersPanel />
        </TabsContent>
        <TabsContent value="hospitals" className="mt-4">
          <HospitalsPanel />
        </TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <AlertsPanel />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

function IncidentsPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery(disastersQuery());
  const update = useServerFn(updateDisasterFn);
  const [drafts, setDrafts] = React.useState<
    Record<string, { status: DisasterStatus; severity: Severity; note: string }>
  >({});

  const mutation = useMutation({
    mutationFn: (input: { id: string; status: DisasterStatus; severity: Severity; note: string }) =>
      update({ data: input }),
    onSuccess: () => {
      toast.success("Incident updated");
      void queryClient.invalidateQueries({ queryKey: ["disasters"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
      void queryClient.invalidateQueries({ queryKey: ["map-data"] });
    },
    onError: (error: Error) => toast.error(error.message || "Update failed"),
  });

  if (!data?.length) {
    return <EmptyState title="No live incidents" description="Nothing to update right now." />;
  }

  return (
    <div className="grid gap-4">
      {data.map((disaster) => {
        const draft = drafts[disaster.id] ?? {
          status: disaster.status,
          severity: disaster.severity,
          note: "",
        };
        return (
          <Card key={disaster.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{disaster.title}</CardTitle>
                <CardDescription>
                  {disaster.type} · {disaster.area}
                </CardDescription>
              </div>
              <SeverityBadge severity={disaster.severity} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`status-${disaster.id}`}>Status</Label>
                  <select
                    id={`status-${disaster.id}`}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.status}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [disaster.id]: { ...draft, status: event.target.value as DisasterStatus },
                      }))
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`severity-${disaster.id}`}>Severity</Label>
                  <select
                    id={`severity-${disaster.id}`}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.severity}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [disaster.id]: { ...draft, severity: event.target.value as Severity },
                      }))
                    }
                  >
                    {SEVERITIES.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <TextAreaField
                id={`note-${disaster.id}`}
                label="Situation note"
                rows={2}
                placeholder="Water receding, two teams on site…"
                value={draft.note}
                onChange={(event) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [disaster.id]: { ...draft, note: event.target.value },
                  }))
                }
              />
              <Button
                size="sm"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ id: disaster.id, ...draft })}
              >
                Save update
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SheltersPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery(sheltersQuery());
  const update = useServerFn(updateShelterFn);
  const [drafts, setDrafts] = React.useState<Record<string, { occupancy: string; status: string }>>(
    {},
  );

  const mutation = useMutation({
    mutationFn: (input: { id: string; occupancy: number; status: string }) =>
      update({ data: input }),
    onSuccess: () => {
      toast.success("Shelter updated");
      void queryClient.invalidateQueries({ queryKey: ["shelters"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (error: Error) => toast.error(error.message || "Update failed"),
  });

  return (
    <div className="grid gap-3">
      {(data ?? []).map((shelter) => {
        const draft = drafts[shelter.id] ?? {
          occupancy: String(shelter.occupancy),
          status: shelter.status,
        };
        return (
          <Card key={shelter.id}>
            <CardHeader>
              <CardTitle className="text-base">{shelter.name}</CardTitle>
              <CardDescription>
                Capacity {shelter.capacity.toLocaleString()} · currently{" "}
                {shelter.occupancy.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="w-32 space-y-1.5">
                <Label htmlFor={`occ-${shelter.id}`}>Occupancy</Label>
                <Input
                  id={`occ-${shelter.id}`}
                  inputMode="numeric"
                  value={draft.occupancy}
                  onChange={(event) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [shelter.id]: { ...draft, occupancy: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="w-40 space-y-1.5">
                <Label htmlFor={`shelter-status-${shelter.id}`}>Status</Label>
                <select
                  id={`shelter-status-${shelter.id}`}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={draft.status}
                  onChange={(event) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [shelter.id]: { ...draft, status: event.target.value },
                    }))
                  }
                >
                  {SHELTER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate({
                    id: shelter.id,
                    occupancy: Number(draft.occupancy || 0),
                    status: draft.status,
                  })
                }
              >
                Save
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function HospitalsPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery(hospitalsQuery());
  const update = useServerFn(updateHospitalFn);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (input: { id: string; available_beds: number }) => update({ data: input }),
    onSuccess: () => {
      toast.success("Bed availability updated");
      void queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (error: Error) => toast.error(error.message || "Update failed"),
  });

  return (
    <div className="grid gap-3">
      {(data ?? []).map((hospital) => {
        const draft = drafts[hospital.id] ?? String(hospital.available_beds);
        return (
          <Card key={hospital.id}>
            <CardHeader>
              <CardTitle className="text-base">{hospital.name}</CardTitle>
              <CardDescription>
                {hospital.available_beds} of {hospital.total_beds} beds free
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="w-40 space-y-1.5">
                <Label htmlFor={`beds-${hospital.id}`}>Available beds</Label>
                <Input
                  id={`beds-${hospital.id}`}
                  inputMode="numeric"
                  value={draft}
                  onChange={(event) =>
                    setDrafts((prev) => ({ ...prev, [hospital.id]: event.target.value }))
                  }
                />
              </div>
              <Button
                size="sm"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate({ id: hospital.id, available_beds: Number(draft || 0) })
                }
              >
                Save
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AlertsPanel() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const publish = useServerFn(publishAlertFn);
  const { data: disasters } = useQuery(disastersQuery());
  const [form, setForm] = React.useState({
    headline: "",
    message: "",
    severity: "HIGH" as Severity,
    area: "",
    disaster_id: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      publish({
        data: {
          headline: form.headline.trim(),
          message: form.message.trim(),
          severity: form.severity,
          area: form.area.trim(),
          disaster_id: form.disaster_id || null,
        },
      }),
    onSuccess: () => {
      toast.success("Alert published");
      setForm((prev) => ({ ...prev, headline: "", message: "" }));
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not publish the alert"),
  });

  if (role !== "admin") {
    return (
      <EmptyState
        icon={ShieldX}
        title="Administrator access required"
        description="Only administrators can broadcast public emergency alerts."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Broadcast an alert</CardTitle>
        <CardDescription>Published instantly to the public alerts feed.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <TextField
            id="alert-headline"
            label="Headline"
            required
            value={form.headline}
            onChange={(event) => setForm((prev) => ({ ...prev, headline: event.target.value }))}
          />
          <TextAreaField
            id="alert-message"
            label="Message"
            required
            rows={4}
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="alert-area"
              label="Area"
              required
              value={form.area}
              onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
            />
            <div className="space-y-1.5">
              <Label htmlFor="alert-severity">Severity</Label>
              <select
                id="alert-severity"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.severity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, severity: event.target.value as Severity }))
                }
              >
                {SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alert-disaster">Linked incident (optional)</Label>
            <select
              id="alert-disaster"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.disaster_id}
              onChange={(event) => setForm((prev) => ({ ...prev, disaster_id: event.target.value }))}
            >
              <option value="">None</option>
              {(disasters ?? []).map((disaster) => (
                <option key={disaster.id} value={disaster.id}>
                  {disaster.title}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="emergency" disabled={mutation.isPending}>
            {mutation.isPending ? "Publishing…" : "Publish alert"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
