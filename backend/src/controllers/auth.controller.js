import * as authService from '../services/auth.service.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validators/auth.schema.js';
import { asyncHandler } from '../utils/httpError.js';

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  res.status(201).json(await authService.register(data));
});

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);
  res.json(await authService.login(data));
});

export const me = asyncHandler(async (req, res) => {
  res.json(await authService.getById(req.user.id));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  res.json(await authService.requestPasswordReset(email));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const data = resetPasswordSchema.parse(req.body);
  res.json(await authService.resetPassword(data));
});

export const changePassword = asyncHandler(async (req, res) => {
  const data = changePasswordSchema.parse(req.body);
  res.json(await authService.changePassword(req.user.id, data));
});
