import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Activity, Search } from "lucide-react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/loading-skeletons";
import { SeverityBadge, StatusBadge } from "@/components/common/status-badge";
import { PublicLayout } from "@/layouts/public-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { disastersQuery } from "@/lib/queries";
import { compactNumber, relativeTime, severityRank } from "@/lib/format";
import type { Severity } from "@/types";

const SEVERITIES: Severity[] = ["CRITICAL", "HIGH", "MODERATE", "LOW"];

export const Route = createFileRoute("/disasters/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { q?: string | undefined; severity?: string | undefined } => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    severity: typeof search["severity"] === "string" ? search["severity"] : undefined,
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(disastersQuery());
  },
  head: () => ({
    meta: [
      { title: "Active Disasters — DISASTRA" },
      {
        name: "description",
        content:
          "Live register of active and recently contained disaster events with severity, status and affected population.",
      },
      { property: "og:title", content: "Active Disasters — DISASTRA" },
      {
        property: "og:description",
        content: "Live register of disaster events with severity, status and affected population.",
      },
    ],
  }),
  component: DisastersPage,
  errorComponent: ({ error }) => (
    <PublicLayout>
      <Container className="py-16">
        <ErrorState title="Couldn't load disasters" description={error.message} />
      </Container>
    </PublicLayout>
  ),
  pendingComponent: () => (
    <PublicLayout>
      <Container className="py-16">
        <ListSkeleton rows={5} />
      </Container>
    </PublicLayout>
  ),
});

function DisastersPage() {
  const { data } = useSuspenseQuery(disastersQuery());
  const { q = "", severity = "ALL" } = Route.useSearch();
  const navigate = Route.useNavigate();

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data
      .filter((item) => (severity === "ALL" ? true : item.severity === severity))
      .filter((item) =>
        needle
          ? `${item.title} ${item.area} ${item.type}`.toLowerCase().includes(needle)
          : true,
      )
      .sort((a, b) => severityRank(a) - severityRank(b));
  }, [data, q, severity]);

  return (
    <PublicLayout>
      <Container className="py-10 sm:py-14">
        <PageHeader
          eyebrow="Operational register"
          title="Disasters"
          description="Every reported, verified, active and contained event currently tracked by the network."
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={q}
              onChange={(event) =>
                navigate({ search: (prev: { q?: string | undefined; severity?: string | undefined }) => ({ ...prev, q: event.target.value }) })
              }
              placeholder="Search by title, type or area"
              aria-label="Search disasters"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["ALL", ...SEVERITIES] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={severity === value ? "default" : "outline"}
                onClick={() => navigate({ search: (prev: { q?: string | undefined; severity?: string | undefined }) => ({ ...prev, severity: value }) })}
              >
                {value === "ALL" ? "All severities" : value}
              </Button>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={Activity}
            title="No matching events"
            description="Adjust the search text or severity filter to widen the results."
          />
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {results.map((item) => (
              <li key={item.id}>
                <Link
                  to="/disasters/$id"
                  params={{ id: item.id }}
                  className="block h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={item.severity} />
                    <StatusBadge status={item.status} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {relativeTime(item.occurred_at)}
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
          </ul>
        )}
      </Container>
    </PublicLayout>
  );
}
