import { z } from 'zod';

export const VN_PHONE_REGEX = /^(0[3|5|7|8|9])[0-9]{8}$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

export const STAFF_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'CHEF',
  'WAITER',
  'CASHIER',
];

export const STAFF_STATUSES = ['ACTIVE', 'INACTIVE'];

export const staffFormSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters'),
    username: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .min(1, 'Please enter an email address')
      .email('Invalid email address format'),
    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || VN_PHONE_REGEX.test(val),
        'Invalid phone number (must be a 10-digit Vietnamese number starting with 03, 05, 07, 08, 09)'
      ),
    password: z.string().optional(),
    role: z.enum(STAFF_ROLES, {
      errorMap: () => ({ message: 'Please select a role' }),
    }),
    salary: z
      .union([z.string(), z.number()])
      .optional()
      .refine(
        (val) =>
          val === '' ||
          val === undefined ||
          (!isNaN(Number(val)) && Number(val) >= 0),
        'Salary must be a non-negative number'
      ),
    status: z.enum(STAFF_STATUSES, {
      errorMap: () => ({ message: 'Please select a status' }),
    }),
    avatar_url: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^https?:\/\/.+/.test(val),
        'Avatar URL must start with http:// or https://'
      ),
    isEditing: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isEditing) {
      if (!data.username || data.username.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['username'],
          message: 'Username must be at least 3 characters',
        });
      } else if (data.username.length > 30) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['username'],
          message: 'Username must not exceed 30 characters',
        });
      } else if (!USERNAME_REGEX.test(data.username)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['username'],
          message: 'Username can only contain alphanumeric characters and underscores',
        });
      }

      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'Password is required and must be at least 6 characters',
        });
      }
    } else {
      if (data.password && data.password.length > 0 && data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'New password must be at least 6 characters',
        });
      }
    }
  });
