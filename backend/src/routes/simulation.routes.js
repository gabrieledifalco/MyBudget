import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';

// Simulatore di risparmio
// TODO: collegare i controller del modulo (controllers/simulation.controller.js)
export const simulationRouter = Router();

simulationRouter.use(requireAuth);

simulationRouter.get('/', (_req, res) => res.status(501).json({ message: 'Non ancora implementato' }));
