import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  profileType: z.enum(['INDIVIDUAL', 'FAMILY']).default('INDIVIDUAL'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
