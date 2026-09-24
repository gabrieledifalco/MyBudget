import * as dashboardService from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/httpError.js";

export const getSummary = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getSummary(req.user.id));
});

export const getTrend = asyncHandler(async (req, res) => {
  const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);
  res.json(await dashboardService.getTrend(req.user.id, months));
});

export const getDistribution = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getDistribution(req.user.id));
});
