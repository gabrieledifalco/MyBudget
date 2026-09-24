import { Router } from 'express';

import { authRouter } from './auth.routes.js';
import { profileRouter } from './profile.routes.js';
import { incomeRouter } from './income.routes.js';
import { expenseRouter } from './expense.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { insightsRouter } from './insights.routes.js';
import { simulationRouter } from './simulation.routes.js';

export const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/incomes', incomeRouter);
router.use('/expenses', expenseRouter);
router.use('/dashboard', dashboardRouter);
router.use('/insights', insightsRouter);
router.use('/simulations', simulationRouter);
