import { z } from 'zod';

export const portalLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const requestPasswordResetSchema = z.object({ email: z.string().email() });

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});
