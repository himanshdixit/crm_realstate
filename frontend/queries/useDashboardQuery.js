"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import { queryKeys } from "./queryKeys";

export function useDashboardQuery(months) {
  return useQuery({ queryKey: queryKeys.dashboard(months), queryFn: () => dashboardService.overview(months), staleTime: 30_000, refetchInterval: 120_000 });
}
