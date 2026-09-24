import {
  getUserFinancials,
  computeKpis,
  computeTrend,
  computeExpenseDistribution,
} from "./finance.service.js";

export async function getSummary(userId) {
  const financials = await getUserFinancials(userId);
  return computeKpis(financials);
}

export async function getTrend(userId, months) {
  const financials = await getUserFinancials(userId);
  return computeTrend(financials, months);
}

export async function getDistribution(userId) {
  const financials = await getUserFinancials(userId);
  return computeExpenseDistribution(financials);
}
