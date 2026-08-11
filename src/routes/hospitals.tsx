import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Ambulance, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/loading-skeletons";
import { PublicLayout } from "@/layouts/public-layout";
import { hospitalsQuery } from "@/lib/queries";

export const Route = createFileRoute("/hospitals")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(hospitalsQuery());
  },
  head: () => ({
    meta: [
      { title: "Hospital Capacity — DISASTRA" },
      {
        name: "description",
        content:
          "Live hospital bed availability, emergency readiness and emergency contact numbers across the response network.",
      },
      { property: "og:title", content: "Hospital Capacity — DISASTRA" },
      {
        property: "og:description",
        content: "Live hospital bed availability, emergency readiness and emergency contacts.",
      },
    ],
  }),
  component: HospitalsPage,
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
        <ErrorState title="Couldn't load hospitals" description={error.message} />
      </Container>
    </PublicLayout>
  ),
});

function HospitalsPage() {
  const { data } = useSuspenseQuery(hospitalsQuery());

  return (
    <PublicLayout>
      <Container className="py-10 sm:py-14">
        <PageHeader
          eyebrow="Medical readiness"
          title="Hospitals"
          description="Bed availability and emergency capability across participating hospitals."
        />

        {data.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={Ambulance}
            title="No hospitals listed"
            description="No hospital has been registered in the network yet."
          />
        ) : (
          <div className="mt-8 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <caption className="sr-only">Hospital bed availability</caption>
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    Hospital
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    Location
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    Beds available
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    Emergency ready
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                    Emergency line
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((hospital) => (
                  <tr key={hospital.id} className="border-t border-border">
                    <th scope="row" className="px-4 py-3 font-medium text-foreground">
                      {hospital.name}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="flex items-start gap-1.5">
                        <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                        {hospital.address}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          hospital.available_beds === 0
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {hospital.available_beds}
                      </span>
                      <span className="text-muted-foreground"> / {hospital.total_beds}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {hospital.emergency_capable ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      {hospital.contact_phone ? (
                        <a
                          href={`tel:${hospital.contact_phone}`}
                          className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                        >
                          <Phone aria-hidden="true" className="size-3.5" />
                          {hospital.contact_phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </PublicLayout>
  );
}
