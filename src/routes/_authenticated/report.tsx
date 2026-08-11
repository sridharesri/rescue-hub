import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { LocateFixed, Siren } from "lucide-react";

import { AppLayout } from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TextAreaField, TextField } from "@/components/common/form-field";
import { Label } from "@/components/ui/label";
import { submitReport } from "@/lib/workspace.functions";
import type { Severity } from "@/types";

const SEVERITIES: Severity[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];
const TYPES = ["Flood", "Earthquake", "Cyclone", "Wildfire", "Landslide", "Industrial", "Other"];

export const Route = createFileRoute("/_authenticated/report")({
  head: () => ({
    meta: [
      { title: "Report an incident — DISASTRA" },
      {
        name: "description",
        content:
          "Submit a disaster or emergency report with location, severity and impact details for responder verification.",
      },
      { property: "og:title", content: "Report an incident — DISASTRA" },
      {
        property: "og:description",
        content: "Send verified-first incident reports to DISASTRA response teams.",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submit = useServerFn(submitReport);

  const [form, setForm] = React.useState({
    title: "",
    type: TYPES[0] as string,
    description: "",
    severity: "MODERATE" as Severity,
    area: "",
    latitude: "",
    longitude: "",
    affected_estimate: "0",
  });

  const mutation = useMutation({
    mutationFn: () =>
      submit({
        data: {
          title: form.title.trim(),
          type: form.type,
          description: form.description.trim(),
          severity: form.severity,
          area: form.area.trim(),
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          affected_estimate: Number(form.affected_estimate || 0),
        },
      }),
    onSuccess: () => {
      toast.success("Report submitted for verification");
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
      void navigate({ to: "/my-reports" });
    },
    onError: (error: Error) => toast.error(error.message || "Could not submit the report"),
  });

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Location is not available in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(5),
          longitude: position.coords.longitude.toFixed(5),
        })),
      () => toast.error("Could not read your location"),
    );
  }

  const invalidCoords =
    form.latitude === "" ||
    form.longitude === "" ||
    Number.isNaN(Number(form.latitude)) ||
    Number.isNaN(Number(form.longitude));

  return (
    <AppLayout title="Report an incident">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Siren aria-hidden="true" className="size-5 text-destructive" />
            Incident report
          </CardTitle>
          <CardDescription>
            Reports stay private until a responder verifies them. Give as much detail as you safely
            can.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (invalidCoords) {
                toast.error("Add a valid latitude and longitude");
                return;
              }
              mutation.mutate();
            }}
          >
            <TextField
              id="title"
              label="What is happening?"
              required
              placeholder="Flash flooding on the riverside road"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                >
                  {TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="severity">Severity</Label>
                <select
                  id="severity"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.severity}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, severity: event.target.value as Severity }))
                  }
                >
                  {SEVERITIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TextAreaField
              id="description"
              label="Describe the situation"
              required
              rows={5}
              placeholder="Water level, trapped people, blocked roads, immediate needs…"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />

            <TextField
              id="area"
              label="Area / locality"
              required
              placeholder="Ward 12, Riverside"
              value={form.area}
              onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                id="latitude"
                label="Latitude"
                required
                inputMode="decimal"
                value={form.latitude}
                onChange={(event) => setForm((prev) => ({ ...prev, latitude: event.target.value }))}
              />
              <TextField
                id="longitude"
                label="Longitude"
                required
                inputMode="decimal"
                value={form.longitude}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, longitude: event.target.value }))
                }
              />
              <div className="flex items-end">
                <Button type="button" variant="outline" className="w-full" onClick={useMyLocation}>
                  <LocateFixed aria-hidden="true" />
                  Use my location
                </Button>
              </div>
            </div>

            <TextField
              id="affected"
              label="Estimated people affected"
              inputMode="numeric"
              value={form.affected_estimate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, affected_estimate: event.target.value }))
              }
            />

            <Button type="submit" variant="emergency" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting…" : "Submit report"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
