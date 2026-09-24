import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

// KPI giornalieri, mensili e annuali
export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", dashboardController.getSummary);
dashboardRouter.get("/trend", dashboardController.getTrend);
dashboardRouter.get("/distribution", dashboardController.getDistribution);
