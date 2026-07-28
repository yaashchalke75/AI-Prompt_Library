import { z } from 'zod';
import { CATEGORIES, LIMITS } from '@/constants';

export const promptFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(LIMITS.TITLE_MAX, `Title cannot exceed ${LIMITS.TITLE_MAX} characters`),
  content: z
    .string()
    .trim()
    .min(1, 'Prompt content is required')
    .max(LIMITS.CONTENT_MAX, `Prompt content cannot exceed ${LIMITS.CONTENT_MAX} characters`),
  description: z
    .string()
    .trim()
    .max(LIMITS.DESCRIPTION_MAX, `Description cannot exceed ${LIMITS.DESCRIPTION_MAX} characters`)
    .optional()
    .or(z.literal('')),
  category: z.enum(CATEGORIES, { message: 'Please select a category' }),
  tagsInput: z.string().optional().or(z.literal('')),
});

export type PromptFormValues = z.infer<typeof promptFormSchema>;
