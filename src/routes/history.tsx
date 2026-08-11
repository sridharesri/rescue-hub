import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Archive } from "lucide-react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/loading-skeletons";
import { SeverityBadge, StatusBadge } from "@/components/common/status-badge";
import { PublicLayout } from "@/layouts/public-layout";
import { archivedDisastersQuery } from "@/lib/queries";
import { compactNumber } from "@/lib/format";

export const Route = createFileRoute("/history")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(archivedDisastersQuery());
  },
  head: () => ({
    meta: [
      { title: "Disaster History — DISASTRA" },
      {
        name: "description",
        content: "Archive of past disaster events, response timelines and recovery outcomes.",
      },
      { property: "og:title", content: "Disaster History — DISASTRA" },
      {
        property: "og:description",
        content: "Archive of past disasters, response timelines and recovery outcomes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
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
        <ErrorState title="Couldn't load the archive" description={error.message} />
      </Container>
    </PublicLayout>
  ),
});

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function HistoryPage() {
  const { data } = useSuspenseQuery(archivedDisastersQuery());

  const stats = useMemo(
    () => ({
      events: data.length,
      affected: data.reduce((sum, item) => sum + (item.affected_people ?? 0), 0),
      areas: new Set(data.map((item) => item.area)).size,
    }),
    [data],
  );

  return (
    <PublicLayout>
      <Container className="py-10 sm:py-14">
        <PageHeader
          eyebrow="Archive"
          title="Disaster History"
          description="Resolved events with their response timelines, impact figures and recovery outcomes."
        />

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Resolved events", value: compactNumber(stats.events) },
            { label: "People affected", value: compactNumber(stats.affected) },
            { label: "Areas covered", value: compactNumber(stats.areas) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>

        {data.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={Archive}
            title="No resolved events yet"
            description="Once an event is marked resolved in the operations console it moves into this archive."
          />
        ) : (
          <ol className="mt-10 space-y-4 border-l border-border pl-5">
            {data.map((item) => (
              <li key={item.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[27px] top-4 size-3 rounded-full border-2 border-background bg-primary"
                />
                <Link
                  to="/disasters/$id"
                  params={{ id: item.id }}
                  className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={item.severity} />
                    <StatusBadge status={item.status} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatDate(item.occurred_at)} → {formatDate(item.resolved_at)}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.type} · {item.area}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    {compactNumber(item.affected_people)} people affected
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Container>
    </PublicLayout>
  );
}
