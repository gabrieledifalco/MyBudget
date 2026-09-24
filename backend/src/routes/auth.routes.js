import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/me', requireAuth, authController.me);

authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.post('/change-password', requireAuth, authController.changePassword);
