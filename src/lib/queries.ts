import { queryOptions } from "@tanstack/react-query";
import {
  getAlerts,
  getArchivedDisasters,
  getDisasterDetail,
  getDisasters,
  getHospitals,
  getMapData,
  getNgos,
  getOverview,
  getShelters,
} from "@/lib/disastra.functions";
import { getRescueTeams, getRescueTeamUpdates } from "@/lib/rescue.functions";

export const overviewQuery = () =>
  queryOptions({ queryKey: ["overview"], queryFn: () => getOverview() });

export const disastersQuery = () =>
  queryOptions({ queryKey: ["disasters", "live"], queryFn: () => getDisasters() });

export const archivedDisastersQuery = () =>
  queryOptions({ queryKey: ["disasters", "archived"], queryFn: () => getArchivedDisasters() });

export const disasterDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["disasters", "detail", id],
    queryFn: () => getDisasterDetail({ data: { id } }),
  });

export const alertsQuery = () => queryOptions({ queryKey: ["alerts"], queryFn: () => getAlerts() });

export const sheltersQuery = () =>
  queryOptions({ queryKey: ["shelters"], queryFn: () => getShelters() });

export const hospitalsQuery = () =>
  queryOptions({ queryKey: ["hospitals"], queryFn: () => getHospitals() });

export const ngosQuery = () => queryOptions({ queryKey: ["ngos"], queryFn: () => getNgos() });

export const mapDataQuery = () =>
  queryOptions({ queryKey: ["map-data"], queryFn: () => getMapData() });

export const rescueTeamsQuery = () =>
  queryOptions({ queryKey: ["rescue-teams"], queryFn: () => getRescueTeams() });

export const rescueTeamUpdatesQuery = (teamId: string) =>
  queryOptions({
    queryKey: ["rescue-teams", "updates", teamId],
    queryFn: () => getRescueTeamUpdates({ data: { teamId } }),
  });
