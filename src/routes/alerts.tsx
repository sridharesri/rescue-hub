import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/loading-skeletons";
import { SeverityBadge } from "@/components/common/status-badge";
import { PublicLayout } from "@/layouts/public-layout";
import { alertsQuery } from "@/lib/queries";
import { formatDateTime, isAlertLive, relativeTime } from "@/lib/format";

export const Route = createFileRoute("/alerts")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(alertsQuery());
  },
  head: () => ({
    meta: [
      { title: "Emergency Alerts — DISASTRA" },
      {
        name: "description",
        content:
          "Live emergency broadcasts from disaster authorities, with severity, affected area and expiry time.",
      },
      { property: "og:title", content: "Emergency Alerts — DISASTRA" },
      {
        property: "og:description",
        content: "Live emergency broadcasts with severity, affected area and expiry time.",
      },
    ],
  }),
  component: AlertsPage,
  pendingComponent: () => (
    <PublicLayout>
      <Container className="py-16">
        <ListSkeleton rows={5} />
      </Container>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => (
    <PublicLayout>
      <Container className="py-16">
        <ErrorState title="Couldn't load alerts" description={error.message} />
      </Container>
    </PublicLayout>
  ),
});

function AlertsPage() {
  const { data } = useSuspenseQuery(alertsQuery());
  const live = data.filter(isAlertLive);
  const expired = data.filter((alert) => !isAlertLive(alert));

  return (
    <PublicLayout>
      <Container className="py-10 sm:py-14">
        <PageHeader
          eyebrow="Broadcast feed"
          title="Alerts"
          description="Official emergency broadcasts, newest first. Expired notices are kept for reference."
        />

        <section className="mt-8">
          <h2 className="eyebrow text-primary">Live now ({live.length})</h2>
          {live.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={BellRing}
              title="No live alerts"
              description="There are no active broadcasts at this time."
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {live.map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs text-muted-foreground">
                      {alert.area} · {relativeTime(alert.issued_at)}
                    </span>
                    {alert.expires_at ? (
                      <span className="ml-auto text-xs text-muted-foreground">
                        Valid until {formatDateTime(alert.expires_at)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{alert.headline}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                  <p className="mt-3 text-xs text-muted-foreground">Issued by {alert.issued_by}</p>
                  {alert.disaster_id ? (
                    <Link
                      to="/disasters/$id"
                      params={{ id: alert.disaster_id }}
                      className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      View linked event
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {expired.length > 0 ? (
          <section className="mt-12">
            <h2 className="eyebrow text-muted-foreground">Expired ({expired.length})</h2>
            <ul className="mt-4 space-y-2">
              {expired.map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-lg border border-border bg-muted/30 p-4 opacity-80"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs text-muted-foreground">{alert.area}</span>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground">{alert.headline}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </PublicLayout>
  );
}
