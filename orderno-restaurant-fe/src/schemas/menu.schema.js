import { z } from 'zod';

export const menuItemFormSchema = z
  .object({
    name: z
      .string({ required_error: 'Please enter dish name' })
      .trim()
      .min(2, 'Dish name must be at least 2 characters')
      .max(150, 'Dish name must not exceed 150 characters'),

    category_id: z.coerce
      .number({ required_error: 'Please select a category' })
      .int('Invalid category')
      .positive('Please select a menu category'),

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

    original_price: z.coerce
      .number({ required_error: 'Please enter original price' })
      .min(0, 'Original price must be greater than or equal to 0'),

    discount_price: z
      .union([z.string(), z.number()])
      .optional()
      .nullable()
      .refine(
        (val) =>
          val === '' ||
          val === null ||
          val === undefined ||
          (!isNaN(Number(val)) && Number(val) >= 0),
        'Discount price must be greater than or equal to 0'
      ),

    is_best_seller: z.boolean().optional().default(false),
    is_on_promo: z.boolean().optional().default(false),
    is_new: z.boolean().optional().default(false),
    is_available: z.boolean().optional().default(true),
    sort_order: z.coerce.number().optional().default(0),

    attributes: z
      .union([z.record(z.any()), z.string()])
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val || (typeof val === 'string' && val.trim() === '')) return true;
          if (typeof val === 'object') return true;
          try {
            const parsed = JSON.parse(val);
            return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
          } catch {
            return false;
          }
        },
        'Attributes must be a valid JSON object string (e.g. {"spiciness": "Mild"})'
      ),
  })
  .superRefine((data, ctx) => {
    const orig = Number(data.original_price);
    const disc =
      data.discount_price !== '' &&
      data.discount_price !== null &&
      data.discount_price !== undefined
        ? Number(data.discount_price)
        : null;

    if (disc !== null && !isNaN(disc) && disc > orig) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount_price'],
        message: 'Discount price cannot exceed original price',
      });
    }
  });

export const categoryFormSchema = z.object({
  name: z
    .string({ required_error: 'Please enter category name' })
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters'),

  description: z.string().trim().optional().or(z.literal('')),

  sort_order: z.coerce.number().optional().default(0),

  is_active: z.boolean().optional().default(true),
});
