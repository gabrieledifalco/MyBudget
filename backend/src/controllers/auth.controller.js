import * as authService from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.schema.js';
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
