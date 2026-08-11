import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LifeBuoy, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/loading-skeletons";
import { PublicLayout } from "@/layouts/public-layout";
import { sheltersQuery } from "@/lib/queries";
import { occupancyRatio } from "@/lib/format";

export const Route = createFileRoute("/shelters")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(sheltersQuery());
  },
  head: () => ({
    meta: [
      { title: "Relief Shelters — DISASTRA" },
      {
        name: "description",
        content:
          "Directory of open relief shelters with live occupancy, capacity, contact numbers and facilities.",
      },
      { property: "og:title", content: "Relief Shelters — DISASTRA" },
      {
        property: "og:description",
        content: "Open relief shelters with live occupancy, contact numbers and facilities.",
      },
    ],
  }),
  component: SheltersPage,
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
        <ErrorState title="Couldn't load shelters" description={error.message} />
      </Container>
    </PublicLayout>
  ),
});

function SheltersPage() {
  const { data } = useSuspenseQuery(sheltersQuery());

  return (
    <PublicLayout>
      <Container className="py-10 sm:py-14">
        <PageHeader
          eyebrow="Capacity network"
          title="Shelters"
          description="Relief camps and shelters currently accepting people, ordered by available space."
        />

        {data.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={LifeBuoy}
            title="No shelters listed"
            description="No shelter has been registered in the network yet."
          />
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((shelter) => {
              const ratio = occupancyRatio(shelter);
              const free = Math.max(0, shelter.capacity - shelter.occupancy);
              return (
                <li
                  key={shelter.id}
                  className="flex h-full flex-col rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-foreground">{shelter.name}</h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        shelter.status === "OPEN"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {shelter.status === "OPEN" ? "Open" : shelter.status === "FULL" ? "Full" : "Closed"}
                    </span>
                  </div>

                  <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    {shelter.address}
                  </p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className="font-medium text-foreground">
                        {shelter.occupancy} / {shelter.capacity}
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round(ratio * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Occupancy of ${shelter.name}`}
                      className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className={`h-full rounded-full ${
                          ratio > 0.9
                            ? "bg-destructive"
                            : ratio > 0.7
                              ? "bg-chart-4"
                              : "bg-primary"
                        }`}
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">{free} places free</p>
                  </div>

                  {shelter.facilities.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {shelter.facilities.map((facility) => (
                        <li
                          key={facility}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {facility}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {shelter.contact_phone ? (
                    <a
                      href={`tel:${shelter.contact_phone}`}
                      className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-medium text-primary hover:underline"
                    >
                      <Phone aria-hidden="true" className="size-3.5" />
                      {shelter.contact_phone}
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </PublicLayout>
  );
}
