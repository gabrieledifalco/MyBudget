import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';

// Entrate da lavoro e tassazione
// TODO: collegare i controller del modulo (controllers/income.controller.js)
export const incomeRouter = Router();

incomeRouter.use(requireAuth);

incomeRouter.get('/', (_req, res) => res.status(501).json({ message: 'Non ancora implementato' }));
