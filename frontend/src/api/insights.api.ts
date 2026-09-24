import { api } from "./client";
import type {
  FinancialAnalysis,
  HealthScore,
  Suggestion,
} from "@/types/domain";

export async function getAnalysis(): Promise<FinancialAnalysis> {
  const { data } = await api.get<FinancialAnalysis>("/insights/analysis");
  return data;
}

export async function getSuggestions(): Promise<Suggestion[]> {
  const { data } = await api.get<Suggestion[]>("/insights/suggestions");
  return data;
}

export async function getHealthScore(): Promise<HealthScore> {
  const { data } = await api.get<HealthScore>("/insights/health-score");
  return data;
}
