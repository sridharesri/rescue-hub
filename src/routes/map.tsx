import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { PublicLayout } from "@/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { mapDataQuery } from "@/lib/queries";
import type { MapLayers } from "@/components/map/disaster-map";

const DisasterMap = lazy(() => import("@/components/map/disaster-map"));

export const Route = createFileRoute("/map")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(mapDataQuery());
  },
  head: () => ({
    meta: [
      { title: "Live Disaster Map — DISASTRA" },
      {
        name: "description",
        content:
          "Live operational map of disasters, shelters and hospitals across affected regions, on OpenStreetMap.",
      },
      { property: "og:title", content: "Live Disaster Map — DISASTRA" },
      {
        property: "og:description",
        content: "Disasters, shelters and hospitals on one live operational map.",
      },
    ],
  }),
  component: MapPage,
  errorComponent: ({ error }) => (
    <PublicLayout>
      <Container className="py-16">
        <ErrorState title="Couldn't load the map" description={error.message} />
      </Container>
    </PublicLayout>
  ),
});

const MapFallback = () => (
  <div className="h-[70vh] min-h-[420px] w-full animate-pulse rounded-xl bg-muted" />
);

function MapPage() {
  const { data } = useSuspenseQuery(mapDataQuery());
  const [layers, setLayers] = useState<MapLayers>({
    disasters: true,
    shelters: true,
    hospitals: true,
  });

  const toggle = (key: keyof MapLayers) =>
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <PublicLayout>
      <Container className="py-10 sm:py-14">
        <PageHeader
          eyebrow="Situational awareness"
          title="Live map"
          description="Disaster epicentres, relief shelters and hospitals plotted on one operational view."
        />

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={layers.disasters ? "default" : "outline"}
            aria-pressed={layers.disasters}
            onClick={() => toggle("disasters")}
          >
            Disasters ({data.disasters.length})
          </Button>
          <Button
            size="sm"
            variant={layers.shelters ? "default" : "outline"}
            aria-pressed={layers.shelters}
            onClick={() => toggle("shelters")}
          >
            Shelters ({data.shelters.length})
          </Button>
          <Button
            size="sm"
            variant={layers.hospitals ? "default" : "outline"}
            aria-pressed={layers.hospitals}
            onClick={() => toggle("hospitals")}
          >
            Hospitals ({data.hospitals.length})
          </Button>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          <ClientOnly fallback={<MapFallback />}>
            <Suspense fallback={<MapFallback />}>
              <DisasterMap
                disasters={data.disasters}
                shelters={data.shelters}
                hospitals={data.hospitals}
                layers={layers}
              />
            </Suspense>
          </ClientOnly>
        </div>
      </Container>
    </PublicLayout>
  );
}
