import { api } from "./client";
import type {
  DashboardSummary,
  DistributionSlice,
  TrendGranularity,
  TrendPoint,
} from "@/types/domain";

export type DashboardGranularity = "day" | "month" | "year";

export interface PeriodKpi {
  income: number;
  expenses: number;
  balance: number;
  period: string;
  granularity: DashboardGranularity;
}

export interface DashboardParams {
  granularity?: DashboardGranularity;
  refDate?: string; // ISO date string
  memberId?: string;
}

export async function getSummary(params?: DashboardParams): Promise<DashboardSummary | PeriodKpi> {
  const { data } = await api.get<DashboardSummary | PeriodKpi>("/dashboard/summary", { params });
  return data;
}

export async function getTrend(
  granularity: TrendGranularity = "month",
  periods?: number,
  params?: DashboardParams,
): Promise<TrendPoint[]> {
  const { data } = await api.get<TrendPoint[]>("/dashboard/trend", {
    params: { granularity, periods, ...params },
  });
  return data;
}

export async function getDistribution(params?: DashboardParams): Promise<DistributionSlice[]> {
  const { data } = await api.get<DistributionSlice[]>("/dashboard/distribution", { params });
  return data;
}
