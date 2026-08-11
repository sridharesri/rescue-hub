import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { LifeBuoy, Plus, Radio } from "lucide-react";

import { AppLayout } from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TextAreaField, TextField } from "@/components/common/form-field";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { disastersQuery, rescueTeamUpdatesQuery, rescueTeamsQuery } from "@/lib/queries";
import {
  advanceRescueTeamFn,
  createRescueTeamFn,
  setRescueAvailabilityFn,
} from "@/lib/rescue.functions";
import { RESCUE_TRANSITIONS, type RescueTeam } from "@/types/rescue";
import type { RescueStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/rescue-teams")({
  head: () => ({
    meta: [
      { title: "Rescue teams — DISASTRA" },
      {
        name: "description",
        content:
          "Manage rescue teams: capabilities, availability and the dispatch lifecycle from available through to completed.",
      },
      { property: "og:title", content: "Rescue teams — DISASTRA" },
      {
        property: "og:description",
        content: "Track rescue team availability and dispatch status in real time.",
      },
    ],
  }),
  component: RescueTeamsPage,
});

function RescueTeamsPage() {
  const { role } = useAuth();
  const canManage = role === "responder" || role === "admin";
  const { data: teams, isLoading } = useQuery(rescueTeamsQuery());

  return (
    <AppLayout title="Rescue teams">
      <div className="space-y-6">
        {canManage ? <CreateTeamCard /> : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading rescue teams…</p>
        ) : !teams?.length ? (
          <EmptyState
            icon={LifeBuoy}
            title="No rescue teams yet"
            description="Register a team to start tracking availability and dispatch status."
          />
        ) : (
          <div className="grid gap-4">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} canManage={canManage} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function CreateTeamCard() {
  const queryClient = useQueryClient();
  const create = useServerFn(createRescueTeamFn);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    organisation: "",
    base_area: "",
    capabilities: "",
    members: "0",
    contact_phone: "",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          name: form.name.trim(),
          organisation: form.organisation.trim(),
          base_area: form.base_area.trim(),
          capabilities: form.capabilities
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          members: Number(form.members) || 0,
          contact_phone: form.contact_phone.trim() || null,
          notes: form.notes.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Rescue team registered");
      setForm({
        name: "",
        organisation: "",
        base_area: "",
        capabilities: "",
        members: "0",
        contact_phone: "",
        notes: "",
      });
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["rescue-teams"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not register team"),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">Register a rescue team</CardTitle>
          <CardDescription>
            Add a unit with its capabilities so it can be dispatched to incidents.
          </CardDescription>
        </div>
        <Button size="sm" variant={open ? "outline" : "default"} onClick={() => setOpen(!open)}>
          <Plus /> {open ? "Cancel" : "New team"}
        </Button>
      </CardHeader>
      {open ? (
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              id="team-name"
              label="Team name"
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <TextField
              id="team-org"
              label="Organisation"
              value={form.organisation}
              onChange={(event) => setForm({ ...form, organisation: event.target.value })}
            />
            <TextField
              id="team-area"
              label="Base area"
              required
              value={form.base_area}
              onChange={(event) => setForm({ ...form, base_area: event.target.value })}
            />
            <TextField
              id="team-members"
              label="Members"
              type="number"
              min={0}
              value={form.members}
              onChange={(event) => setForm({ ...form, members: event.target.value })}
            />
            <TextField
              id="team-capabilities"
              label="Capabilities"
              hint="Comma separated, e.g. Flood rescue, Rope rescue"
              value={form.capabilities}
              onChange={(event) => setForm({ ...form, capabilities: event.target.value })}
            />
            <TextField
              id="team-phone"
              label="Contact phone"
              value={form.contact_phone}
              onChange={(event) => setForm({ ...form, contact_phone: event.target.value })}
            />
          </div>
          <TextAreaField
            id="team-notes"
            label="Notes"
            rows={2}
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
          <Button
            size="sm"
            disabled={mutation.isPending || form.name.length < 2 || form.base_area.length < 2}
            onClick={() => mutation.mutate()}
          >
            Save team
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}

function TeamCard({ team, canManage }: { team: RescueTeam; canManage: boolean }) {
  const queryClient = useQueryClient();
  const { data: disasters } = useQuery({ ...disastersQuery(), enabled: canManage });
  const advance = useServerFn(advanceRescueTeamFn);
  const toggle = useServerFn(setRescueAvailabilityFn);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [disasterId, setDisasterId] = React.useState(team.disaster_id ?? "");
  const [note, setNote] = React.useState("");

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["rescue-teams"] });
  };

  const advanceMutation = useMutation({
    mutationFn: (status: RescueStatus) =>
      advance({ data: { id: team.id, status, disaster_id: disasterId || null, note } }),
    onSuccess: () => {
      toast.success("Team status updated");
      setNote("");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Update failed"),
  });

  const availabilityMutation = useMutation({
    mutationFn: (available: boolean) => toggle({ data: { id: team.id, available } }),
    onSuccess: () => {
      toast.success("Availability updated");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Update failed"),
  });

  const nextStatuses = RESCUE_TRANSITIONS[team.status];
  const assigned = disasters?.find((item) => item.id === team.disaster_id);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base">{team.name}</CardTitle>
          <CardDescription>
            {team.organisation ? `${team.organisation} · ` : ""}
            {team.base_area} · {team.members} members
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={team.status} />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {team.available ? "Available" : "Engaged"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {team.capabilities.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {team.capabilities.map((capability) => (
              <li
                key={capability}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {capability}
              </li>
            ))}
          </ul>
        ) : null}

        {team.notes ? <p className="text-sm text-muted-foreground">{team.notes}</p> : null}

        <p className="text-sm text-muted-foreground">
          {team.disaster_id
            ? `Assigned to: ${assigned?.title ?? "an incident"}`
            : "No incident assigned"}
          {team.contact_phone ? ` · ${team.contact_phone}` : ""}
        </p>

        {canManage ? (
          <div className="space-y-3 border-t border-border pt-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`incident-${team.id}`}>Assign incident</Label>
                <select
                  id={`incident-${team.id}`}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={disasterId}
                  onChange={(event) => setDisasterId(event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {(disasters ?? []).map((disaster) => (
                    <option key={disaster.id} value={disaster.id}>
                      {disaster.title}
                    </option>
                  ))}
                </select>
              </div>
              <TextField
                id={`note-${team.id}`}
                label="Status note"
                placeholder="Two boats en route…"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {nextStatuses.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={status === "AVAILABLE" ? "outline" : "default"}
                  disabled={advanceMutation.isPending}
                  onClick={() => advanceMutation.mutate(status)}
                >
                  <Radio /> {status.replace(/_/g, " ")}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                disabled={availabilityMutation.isPending || team.status !== "AVAILABLE"}
                onClick={() => availabilityMutation.mutate(!team.available)}
              >
                {team.available ? "Mark off-duty" : "Mark on-duty"}
              </Button>
            </div>
          </div>
        ) : null}

        <div>
          <Button size="sm" variant="ghost" onClick={() => setHistoryOpen(!historyOpen)}>
            {historyOpen ? "Hide history" : "Show history"}
          </Button>
          {historyOpen ? <TeamHistory teamId={team.id} /> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamHistory({ teamId }: { teamId: string }) {
  const { data, isLoading } = useQuery(rescueTeamUpdatesQuery(teamId));

  if (isLoading) return <p className="mt-2 text-sm text-muted-foreground">Loading history…</p>;
  if (!data?.length)
    return <p className="mt-2 text-sm text-muted-foreground">No status changes logged yet.</p>;

  return (
    <ol className="mt-2 space-y-2 border-l border-border pl-4">
      {data.map((entry) => (
        <li key={entry.id} className="text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.status} />
            <time className="text-xs text-muted-foreground" dateTime={entry.created_at}>
              {new Date(entry.created_at).toLocaleString()}
            </time>
          </div>
          {entry.note ? <p className="mt-1 text-muted-foreground">{entry.note}</p> : null}
          {entry.author_email ? (
            <p className="text-xs text-muted-foreground">by {entry.author_email}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
