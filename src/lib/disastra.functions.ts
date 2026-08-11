import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getOverview = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchOverview } = await import("./disastra.server");
  return fetchOverview();
});

export const getDisasters = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchDisasters } = await import("./disastra.server");
  return fetchDisasters();
});

export const getArchivedDisasters = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchDisasters } = await import("./disastra.server");
  return fetchDisasters({ archived: true });
});

export const getDisasterDetail = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { fetchDisaster } = await import("./disastra.server");
    return fetchDisaster(data.id);
  });

export const getAlerts = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchAlerts } = await import("./disastra.server");
  return fetchAlerts();
});

export const getShelters = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchShelters } = await import("./disastra.server");
  return fetchShelters();
});

export const getHospitals = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchHospitals } = await import("./disastra.server");
  return fetchHospitals();
});

export const getNgos = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchNgos } = await import("./disastra.server");
  return fetchNgos();
});

export const getMapData = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchMapData } = await import("./disastra.server");
  return fetchMapData();
});
