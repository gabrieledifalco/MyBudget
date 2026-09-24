import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';

// Overview intelligente, suggerimenti e financial health score
// TODO: collegare i controller del modulo (controllers/insights.controller.js)
export const insightsRouter = Router();

insightsRouter.use(requireAuth);

insightsRouter.get('/', (_req, res) => res.status(501).json({ message: 'Non ancora implementato' }));
