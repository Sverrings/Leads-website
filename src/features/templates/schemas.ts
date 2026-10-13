// Shared with the iPhone app: Leads/src/features/templates/schemas.ts. Change both together (see README).
import { z } from 'zod';

export const templateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Give the template a name' })
    .max(80, { error: 'Keep it under 80 characters' }),
  subject: z.string().trim().max(200, { error: 'Keep the subject under 200 characters' }),
  body: z
    .string()
    .trim()
    .min(1, { error: 'Write the message' })
    .max(5000, { error: 'Keep it under 5000 characters' }),
});

export type TemplateFormValues = z.input<typeof templateSchema>;
