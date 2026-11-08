import { z } from 'zod';

export const spaceTypeFormSchema = z
  .object({
    code: z
      .string({ required_error: 'Space code is required' })
      .trim()
      .toUpperCase()
      .min(2, 'Code must be at least 2 characters')
      .max(30, 'Code cannot exceed 30 characters')
      .regex(
        /^[A-Z0-9_-]+$/,
        'Code must contain only uppercase letters, numbers, hyphens or underscores'
      ),

    name: z
      .string({ required_error: 'Space type name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),

    description: z.string().trim().optional().or(z.literal('')),

    image_url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => !val || /^https?:\/\/.+/.test(val),
        'Image URL must start with http:// or https://'
      ),

    total_quantity: z.coerce
      .number({ required_error: 'Total room units is required' })
      .int('Must be an integer')
      .min(1, 'Quantity must be at least 1')
      .default(1),

    min_capacity: z.coerce
      .number()
      .int('Minimum capacity must be an integer')
      .min(1, 'Minimum capacity must be at least 1')
      .default(1),

    max_capacity: z.coerce
      .number({ required_error: 'Maximum capacity is required' })
      .int('Maximum capacity must be an integer')
      .min(1, 'Maximum capacity must be at least 1')
      .default(6),

    surcharge_fee: z.coerce
      .number()
      .min(0, 'Surcharge fee cannot be negative')
      .default(0),

    sort_order: z.coerce.number().int().optional().default(0),

    is_active: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.min_capacity && data.max_capacity && data.max_capacity < data.min_capacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['max_capacity'],
        message: 'Max capacity cannot be smaller than min capacity',
      });
    }
  });
