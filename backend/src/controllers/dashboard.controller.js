import * as dashboardService from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/httpError.js";

export const getSummary = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getSummary(req.user.id));
});

const PERIOD_LIMITS = { day: 90, month: 24, year: 10 };

export const getTrend = asyncHandler(async (req, res) => {
  const granularity = ["day", "month", "year"].includes(req.query.granularity)
    ? req.query.granularity
    : "month";
  const maxPeriods = PERIOD_LIMITS[granularity];
  const periods = req.query.periods
    ? Math.min(Math.max(Number(req.query.periods) || 1, 1), maxPeriods)
    : undefined;
  res.json(
    await dashboardService.getTrend(req.user.id, { granularity, periods }),
  );
});

export const getDistribution = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getDistribution(req.user.id));
});
