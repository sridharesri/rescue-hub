import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppLayout } from "@/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { getMyReports } from "@/lib/workspace.functions";
import type { ReportStatus } from "@/types/workspace";

export const Route = createFileRoute("/_authenticated/my-reports")({
  head: () => ({
    meta: [
      { title: "My reports — DISASTRA" },
      {
        name: "description",
        content: "Track the verification status of every incident report you submitted to DISASTRA.",
      },
      { property: "og:title", content: "My reports — DISASTRA" },
      {
        property: "og:description",
        content: "Follow your submitted incident reports from pending to verified.",
      },
    ],
  }),
  component: MyReportsPage,
});

const STATUS_VARIANT: Record<ReportStatus, "secondary" | "default" | "destructive"> = {
  PENDING: "secondary",
  VERIFIED: "default",
  REJECTED: "destructive",
};

function MyReportsPage() {
  const fetchReports = useServerFn(getMyReports);
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "mine"],
    queryFn: () => fetchReports(),
  });

  return (
    <AppLayout title="My reports">
      <div className="mx-auto grid max-w-4xl gap-4">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading your reports…</p> : null}

        {!isLoading && (data ?? []).length === 0 ? (
          <EmptyState
            title="No reports yet"
            description="Submit your first incident report and responders will review it."
            action={
              <Button asChild variant="emergency">
                <Link to="/report">Report an incident</Link>
              </Button>
            }
          />
        ) : null}

        {(data ?? []).map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{report.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {report.type} · {report.area} ·{" "}
                  {new Date(report.created_at).toLocaleString()}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[report.status]}>{report.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{report.description}</p>
              {report.review_note ? (
                <p className="rounded-md border border-border bg-muted/40 p-3 text-xs">
                  <span className="font-semibold">Responder note: </span>
                  {report.review_note}
                </p>
              ) : null}
              {report.disaster_id ? (
                <Button asChild size="sm" variant="outline">
                  <Link to="/disasters/$id" params={{ id: report.disaster_id }}>
                    View published incident
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
