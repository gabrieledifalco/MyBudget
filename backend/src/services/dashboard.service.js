import {
  getUserFinancials,
  computeKpis,
  computePeriodKpis,
  computeTrend,
  computeExpenseDistribution,
} from "./finance.service.js";

export async function getSummary(userId, { granularity, refDate, memberId } = {}) {
  const financials = await getUserFinancials(userId);
  if (granularity && refDate) {
    return computePeriodKpis(financials, { granularity, refDate, memberId });
  }
  return computeKpis(financials);
}

export async function getTrend(userId, options = {}) {
  const financials = await getUserFinancials(userId);
  return computeTrend(financials, options);
}

export async function getDistribution(userId, options = {}) {
  const financials = await getUserFinancials(userId);
  return computeExpenseDistribution(financials, options);
}
