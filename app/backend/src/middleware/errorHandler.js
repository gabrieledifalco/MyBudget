import { ZodError } from 'zod';
import { env } from '../config/env.js';

// eslint-disable-next-line no-unused-vars -- Express riconosce l'handler dai 4 argomenti
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(422).json({ message: 'Dati non validi', issues: err.issues });
  }

  const status = err.status ?? 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: err.message ?? 'Errore interno del server',
    ...(env.nodeEnv === 'development' && status >= 500 ? { stack: err.stack } : {}),
  });
}
