import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import * as insightsController from "../controllers/insights.controller.js";

// Overview intelligente, suggerimenti e financial health score
export const insightsRouter = Router();

insightsRouter.use(requireAuth);

insightsRouter.get("/analysis", insightsController.getAnalysis);
insightsRouter.get("/suggestions", insightsController.getSuggestions);
insightsRouter.get("/health-score", insightsController.getHealthScore);
