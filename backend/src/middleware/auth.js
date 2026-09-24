import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { httpError } from '../utils/httpError.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next(httpError(401, 'Token mancante'));

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(httpError(401, 'Token non valido o scaduto'));
  }
}
