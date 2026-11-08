const { z } = require('zod');

// Schema tạo mới món ăn
const createMenuItemSchema = z
  .object({
    name: z
      .string({ required_error: 'Tên món ăn là bắt buộc' })
      .trim()
      .min(2, 'Tên món ăn phải có ít nhất 2 ký tự')
      .max(150, 'Tên món ăn không được vượt quá 150 ký tự'),

    category_id: z.coerce
      .number({ required_error: 'Vui lòng chọn danh mục món ăn' })
      .int('Mã danh mục không hợp lệ')
      .positive('Vui lòng chọn danh mục món ăn hợp lệ'),

    slug: z.string().trim().optional().nullable(),

    description: z.string().trim().optional().nullable(),

    image_url: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^https?:\/\/.+/.test(val),
        'URL hình ảnh phải bắt đầu bằng http:// hoặc https://'
      ),

    original_price: z.coerce
      .number({ required_error: 'Giá gốc là bắt buộc' })
      .min(0, 'Giá gốc phải lớn hơn hoặc bằng 0'),

    discount_price: z.coerce
      .number()
      .min(0, 'Giá khuyến mãi không được âm')
      .optional()
      .nullable(),

    is_best_seller: z.union([z.boolean(), z.number()]).optional().default(0),

    is_on_promo: z.union([z.boolean(), z.number()]).optional().default(0),

    is_new: z.union([z.boolean(), z.number()]).optional().default(0),

    is_available: z.union([z.boolean(), z.number()]).optional().default(1),

    sort_order: z.coerce.number().int().optional().default(0),

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
        'Attributes phải là một chuỗi JSON hợp lệ (ví dụ: {"spiciness": "Mild"})'
      ),
  })
  .superRefine((data, ctx) => {
    if (
      data.discount_price !== undefined &&
      data.discount_price !== null &&
      data.discount_price !== '' &&
      Number(data.discount_price) > Number(data.original_price)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount_price'],
        message: 'Giá khuyến mãi không được lớn hơn giá gốc',
      });
    }
  });

// Schema cập nhật món ăn
const updateMenuItemSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Tên món ăn phải có ít nhất 2 ký tự')
      .max(150, 'Tên món ăn không được vượt quá 150 ký tự')
      .optional(),

    category_id: z.coerce
      .number()
      .int()
      .positive('Mã danh mục không hợp lệ')
      .optional(),

    slug: z.string().trim().optional().nullable(),

    description: z.string().trim().optional().nullable(),

    image_url: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^https?:\/\/.+/.test(val),
        'URL hình ảnh phải bắt đầu bằng http:// hoặc https://'
      ),

    original_price: z.coerce
      .number()
      .min(0, 'Giá gốc phải lớn hơn hoặc bằng 0')
      .optional(),

    discount_price: z.coerce
      .number()
      .min(0, 'Giá khuyến mãi không được âm')
      .optional()
      .nullable(),

    is_best_seller: z.union([z.boolean(), z.number()]).optional(),

    is_on_promo: z.union([z.boolean(), z.number()]).optional(),

    is_new: z.union([z.boolean(), z.number()]).optional(),

    is_available: z.union([z.boolean(), z.number()]).optional(),

    sort_order: z.coerce.number().int().optional(),

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
        'Attributes phải là một chuỗi JSON hợp lệ (ví dụ: {"spiciness": "Mild"})'
      ),
  })
  .superRefine((data, ctx) => {
    if (
      data.original_price !== undefined &&
      data.discount_price !== undefined &&
      data.discount_price !== null &&
      data.discount_price !== '' &&
      Number(data.discount_price) > Number(data.original_price)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount_price'],
        message: 'Giá khuyến mãi không được lớn hơn giá gốc',
      });
    }
  });

// Schema đổi nhanh trạng thái còn hàng / hết hàng
const updateAvailabilitySchema = z.object({
  is_available: z.union([z.boolean(), z.number()], {
    required_error: 'Trạng thái khả dụng là bắt buộc',
  }),
});

module.exports = {
  createMenuItemSchema,
  updateMenuItemSchema,
  updateAvailabilitySchema,
};
