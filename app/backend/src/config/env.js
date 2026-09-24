import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  // Se assente, l'endpoint di classificazione risponde 503 e il frontend
  // nasconde il campo: l'app resta pienamente utilizzabile senza.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
};
