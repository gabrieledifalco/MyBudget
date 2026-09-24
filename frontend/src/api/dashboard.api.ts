import { api } from "./client";
import type {
  DashboardSummary,
  DistributionSlice,
  TrendPoint,
} from "@/types/domain";

export async function getSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/dashboard/summary");
  return data;
}

export async function getTrend(months = 6): Promise<TrendPoint[]> {
  const { data } = await api.get<TrendPoint[]>("/dashboard/trend", {
    params: { months },
  });
  return data;
}

export async function getDistribution(): Promise<DistributionSlice[]> {
  const { data } = await api.get<DistributionSlice[]>(
    "/dashboard/distribution",
  );
  return data;
}
