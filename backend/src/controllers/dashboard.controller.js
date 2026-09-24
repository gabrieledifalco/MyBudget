import * as dashboardService from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/httpError.js";

function parseRefDate(raw) {
  if (!raw) return new Date();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
}

const VALID_GRAN = ["day", "month", "year"];
const PERIOD_LIMITS = { day: 90, month: 24, year: 10 };

export const getSummary = asyncHandler(async (req, res) => {
  const granularity = VALID_GRAN.includes(req.query.granularity)
    ? req.query.granularity
    : "month";
  const refDate = parseRefDate(req.query.refDate);
  const memberId = req.query.memberId || undefined;
  res.json(
    await dashboardService.getSummary(req.user.id, { granularity, refDate, memberId }),
  );
});

export const getTrend = asyncHandler(async (req, res) => {
  const granularity = VALID_GRAN.includes(req.query.granularity)
    ? req.query.granularity
    : "month";
  const maxPeriods = PERIOD_LIMITS[granularity];
  const periods = req.query.periods
    ? Math.min(Math.max(Number(req.query.periods) || 1, 1), maxPeriods)
    : undefined;
  const refDate = parseRefDate(req.query.refDate);
  const memberId = req.query.memberId || undefined;
  res.json(
    await dashboardService.getTrend(req.user.id, { granularity, periods, refDate, memberId }),
  );
});

export const getDistribution = asyncHandler(async (req, res) => {
  const granularity = VALID_GRAN.includes(req.query.granularity)
    ? req.query.granularity
    : "month";
  const refDate = parseRefDate(req.query.refDate);
  const memberId = req.query.memberId || undefined;
  res.json(
    await dashboardService.getDistribution(req.user.id, { granularity, refDate, memberId }),
  );
});
