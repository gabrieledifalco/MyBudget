import { api } from "./client";
import type {
  DashboardSummary,
  DistributionSlice,
  TrendGranularity,
  TrendPoint,
} from "@/types/domain";

export async function getSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/dashboard/summary");
  return data;
}

export async function getTrend(
  granularity: TrendGranularity = "month",
  periods?: number,
): Promise<TrendPoint[]> {
  const { data } = await api.get<TrendPoint[]>("/dashboard/trend", {
    params: { granularity, periods },
  });
  return data;
}

export async function getDistribution(): Promise<DistributionSlice[]> {
  const { data } = await api.get<DistributionSlice[]>(
    "/dashboard/distribution",
  );
  return data;
}
