import { z } from 'zod';

export const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
});
