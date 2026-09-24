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

export async function getTrend(userId, options) {
  const financials = await getUserFinancials(userId);
  return computeTrend(financials, options);
}

export async function getDistribution(userId) {
  const financials = await getUserFinancials(userId);
  return computeExpenseDistribution(financials);
}
