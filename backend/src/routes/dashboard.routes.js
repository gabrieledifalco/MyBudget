import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';

// KPI giornalieri, mensili e annuali
// TODO: collegare i controller del modulo (controllers/dashboard.controller.js)
export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get('/', (_req, res) => res.status(501).json({ message: 'Non ancora implementato' }));
