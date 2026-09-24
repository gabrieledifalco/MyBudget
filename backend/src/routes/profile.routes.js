import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';

// Profilo finanziario, nucleo familiare, abitazione, rendite
// TODO: collegare i controller del modulo (controllers/profile.controller.js)
export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get('/', (_req, res) => res.status(501).json({ message: 'Non ancora implementato' }));
