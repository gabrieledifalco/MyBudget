import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';

// Spese fisse, variabili e finanziamenti
// TODO: collegare i controller del modulo (controllers/expense.controller.js)
export const expenseRouter = Router();

expenseRouter.use(requireAuth);

expenseRouter.get('/', (_req, res) => res.status(501).json({ message: 'Non ancora implementato' }));
