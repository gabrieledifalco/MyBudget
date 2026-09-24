import * as insightsService from "../services/insights.service.js";
import { asyncHandler } from "../utils/httpError.js";

export const getAnalysis = asyncHandler(async (req, res) => {
  res.json(await insightsService.getAnalysis(req.user.id));
});

export const getSuggestions = asyncHandler(async (req, res) => {
  res.json(await insightsService.getSuggestions(req.user.id));
});

export const getHealthScore = asyncHandler(async (req, res) => {
  res.json(await insightsService.getHealthScore(req.user.id));
});
