import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCircle2, ShieldX } from "lucide-react";

import { AppLayout } from "@/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/empty-state";
import { SeverityBadge } from "@/components/common/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { getAllReports, reviewReportFn } from "@/lib/workspace.functions";

export const Route = createFileRoute("/_authenticated/queue")({
  head: () => ({
    meta: [
      { title: "Verification queue — DISASTRA" },
      {
        name: "description",
        content:
          "Responder queue for verifying or rejecting citizen incident reports before they go public.",
      },
      { property: "og:title", content: "Verification queue — DISASTRA" },
      {
        property: "og:description",
        content: "Review citizen reports and publish verified incidents.",
      },
    ],
  }),
  component: QueuePage,
});

function QueuePage() {
  const { role, loading } = useAuth();
  const queryClient = useQueryClient();
  const fetchReports = useServerFn(getAllReports);
  const review = useServerFn(reviewReportFn);
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const allowed = role === "responder" || role === "admin";

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "all"],
    queryFn: () => fetchReports(),
    enabled: allowed,
  });

  const mutation = useMutation({
    mutationFn: (input: { id: string; decision: "VERIFIED" | "REJECTED" }) =>
      review({ data: { ...input, note: notes[input.id] ?? "" } }),
    onSuccess: (_result, input) => {
      toast.success(input.decision === "VERIFIED" ? "Report verified and published" : "Report rejected");
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
      void queryClient.invalidateQueries({ queryKey: ["disasters"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (error: Error) => toast.error(error.message || "Review failed"),
  });

  if (!loading && !allowed) {
    return (
      <AppLayout title="Verification queue">
        <EmptyState
          icon={ShieldX}
          title="Responder access required"
          description="Ask a DISASTRA administrator to grant you the responder role to review incoming reports."
        />
      </AppLayout>
    );
  }

  const pending = (data ?? []).filter((report) => report.status === "PENDING");
  const reviewed = (data ?? []).filter((report) => report.status !== "PENDING");

  return (
    <AppLayout title="Verification queue">
      <div className="mx-auto grid max-w-4xl gap-6">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading queue…</p> : null}

        {!isLoading && pending.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Queue is clear"
            description="Every submitted report has been reviewed."
          />
        ) : null}

        {pending.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{report.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {report.type} · {report.area} · {report.affected_estimate.toLocaleString()} affected ·{" "}
                  {report.reporter_email ?? "citizen"} ·{" "}
                  {new Date(report.created_at).toLocaleString()}
                </p>
              </div>
              <SeverityBadge severity={report.severity} />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{report.description}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </p>
              <Textarea
                rows={2}
                placeholder="Review note (optional)"
                value={notes[report.id] ?? ""}
                onChange={(event) =>
                  setNotes((prev) => ({ ...prev, [report.id]: event.target.value }))
                }
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: report.id, decision: "VERIFIED" })}
                >
                  Verify and publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: report.id, decision: "REJECTED" })}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviewed.length ? (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Recently reviewed</h3>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {reviewed.slice(0, 10).map((report) => (
                <li key={report.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="truncate">{report.title}</span>
                  <Badge variant={report.status === "VERIFIED" ? "default" : "destructive"}>
                    {report.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </AppLayout>
  );
}
