import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, BellRing, Hospital as HospitalIcon, LifeBuoy, MapPin } from "lucide-react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/loading-skeletons";
import { SeverityBadge, StatusBadge } from "@/components/common/status-badge";
import { PublicLayout } from "@/layouts/public-layout";
import { disasterDetailQuery } from "@/lib/queries";
import { compactNumber, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/disasters/$id")({
  loader: async ({ context, params }) => {
    const detail = await context.queryClient.ensureQueryData(disasterDetailQuery(params.id));
    if (!detail.disaster) throw notFound();
    return { title: detail.disaster.title, area: detail.disaster.area };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Event unavailable — DISASTRA" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} — DISASTRA`;
    const description = `Live situation report for ${loaderData.title} in ${loaderData.area}, with linked alerts, shelters and hospitals.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: DisasterDetailPage,
  pendingComponent: () => (
    <PublicLayout>
      <Container className="py-16">
        <ListSkeleton rows={4} />
      </Container>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => (
    <PublicLayout>
      <Container className="py-16">
        <ErrorState title="Couldn't load this event" description={error.message} />
      </Container>
    </PublicLayout>
  ),
  notFoundComponent: () => (
    <PublicLayout>
      <Container className="py-16">
        <ErrorState
          title="Event not found"
          description="This disaster record does not exist or has been removed from the register."
        />
      </Container>
    </PublicLayout>
  ),
});

function DisasterDetailPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(disasterDetailQuery(id));
  const disaster = data.disaster!;

  return (
    <PublicLayout>
      <Container className="py-10 sm:py-14">
        <Link
          to="/disasters"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to disasters
        </Link>

        <PageHeader
          className="mt-4"
          eyebrow={disaster.type}
          title={disaster.title}
          description={disaster.description}
          actions={
            <div className="flex flex-wrap gap-2">
              <SeverityBadge severity={disaster.severity} />
              <StatusBadge status={disaster.status} />
            </div>
          }
        />

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Location" value={disaster.area} />
          <Stat label="People affected" value={compactNumber(disaster.affected_people)} />
          <Stat label="First reported" value={formatDateTime(disaster.occurred_at)} />
        </dl>

        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <BellRing aria-hidden="true" className="size-5 text-primary" />
            Linked alerts
          </h2>
          {data.alerts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No alerts have been broadcast for this event yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.alerts.map((alert) => (
                <li key={alert.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(alert.issued_at)} · {alert.issued_by}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground">{alert.headline}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <LifeBuoy aria-hidden="true" className="size-5 text-primary" />
              Nearest shelters
            </h2>
            <ul className="mt-4 space-y-3">
              {data.shelters.map((shelter) => (
                <li key={shelter.id} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-semibold text-foreground">{shelter.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin aria-hidden="true" className="size-3.5" />
                    {shelter.address}
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {shelter.capacity - shelter.occupancy} of {shelter.capacity} places free
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <HospitalIcon aria-hidden="true" className="size-5 text-primary" />
              Nearest hospitals
            </h2>
            <ul className="mt-4 space-y-3">
              {data.hospitals.map((hospital) => (
                <li key={hospital.id} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-semibold text-foreground">{hospital.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin aria-hidden="true" className="size-3.5" />
                    {hospital.address}
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {hospital.available_beds} beds available of {hospital.total_beds}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </PublicLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}
