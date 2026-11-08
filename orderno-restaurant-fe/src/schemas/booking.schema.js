import { z } from 'zod';

export const BOOKING_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending Confirmation' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'SEATED', label: 'Seated / Checked-in' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const BOOKING_TYPE_OPTIONS = [
  { value: 'REGULAR_TABLE', label: 'Regular Table / Suite' },
  { value: 'PARTY_EVENT', label: 'Banquet & Party Event' },
  { value: 'DELIVERY', label: 'Home Delivery / Ship' },
];

export const bookingItemSchema = z.object({
  menu_item_id: z.coerce
    .number({ required_error: 'Menu item ID is required' })
    .int()
    .positive('Invalid menu item ID'),
  quantity: z.coerce
    .number()
    .int()
    .min(1, 'Item quantity must be at least 1')
    .max(100, 'Item quantity cannot exceed 100')
    .default(1),
  note: z
    .string()
    .trim()
    .max(300, 'Item note cannot exceed 300 characters')
    .optional()
    .nullable(),
});

const baseBookingFields = {
  booking_type: z
    .enum(['REGULAR_TABLE', 'PARTY_EVENT', 'DELIVERY'])
    .default('REGULAR_TABLE'),

  space_type_id: z
    .union([z.coerce.number().int().positive(), z.literal(''), z.null()])
    .optional()
    .nullable(),

  rooms_requested: z.coerce
    .number()
    .int('Must be a whole number')
    .min(1, 'At least 1 room/table unit is required')
    .max(20, 'Cannot exceed 20 rooms/tables')
    .default(1),

  customer_name: z
    .string({ required_error: 'Guest full name is required' })
    .trim()
    .min(2, 'Guest name must be at least 2 characters')
    .max(100, 'Guest name cannot exceed 100 characters'),

  customer_phone: z
    .string({ required_error: 'Guest phone number is required' })
    .trim()
    .regex(/^[0-9+\s\-().]{8,20}$/, 'Phone number must be between 8 and 20 digits'),

  customer_email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal(''))
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Please enter a valid email address'
    ),

  booking_date: z
    .string({ required_error: 'Reservation date is required' })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid date (YYYY-MM-DD)'),

  booking_time: z
    .string({ required_error: 'Reservation time is required' })
    .trim()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
      'Please enter a valid time (HH:mm)'
    ),

  duration_minutes: z.coerce
    .number()
    .int()
    .min(30, 'Minimum duration is 30 minutes')
    .max(480, 'Maximum duration is 480 minutes')
    .default(120),

  guest_adults: z.coerce
    .number({ required_error: 'Adult count is required' })
    .int()
    .min(1, 'At least 1 adult guest is required')
    .max(500, 'Adult count cannot exceed 500')
    .default(2),

  guest_children: z.coerce
    .number()
    .int()
    .min(0, 'Children count cannot be negative')
    .max(200, 'Children count cannot exceed 200')
    .default(0),

  event_type: z
    .string()
    .trim()
    .max(150, 'Event type cannot exceed 150 characters')
    .optional()
    .nullable()
    .or(z.literal('')),

  special_requests: z
    .string()
    .trim()
    .max(1000, 'Special requests cannot exceed 1000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),

  status: z
    .enum(['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'])
    .default('CONFIRMED'),

  admin_note: z
    .string()
    .trim()
    .max(1000, 'Admin note cannot exceed 1000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),

  items: z.array(bookingItemSchema).optional().default([]),
};

export const bookingFormSchema = z
  .object(baseBookingFields)
  .superRefine((data, ctx) => {
    if (
      data.booking_type !== 'DELIVERY' &&
      (!data.space_type_id || Number(data.space_type_id) <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['space_type_id'],
        message: 'Please select a dining space',
      });
    }
  });

export const publicOrderBookingSchema = z
  .object({
    ...baseBookingFields,
    customer_email: z
      .string({ required_error: 'Customer email is required' })
      .trim()
      .min(1, 'Customer email is required')
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid customer email address'),
    items: z
      .array(bookingItemSchema)
      .min(1, 'Please select at least one dish to place an order'),
  })
  .superRefine((data, ctx) => {
    if (
      data.booking_type !== 'DELIVERY' &&
      (!data.space_type_id || Number(data.space_type_id) <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['space_type_id'],
        message: 'Please select a room / dining space type',
      });
    }
  });

export const lookupFormSchema = z
  .object({
    searchType: z.enum(['phone', 'email', 'code']).default('phone'),
    searchValue: z.string().trim().min(1, 'Please enter a phone number or email address'),
  })
  .superRefine((data, ctx) => {
    if (data.searchType === 'phone') {
      if (!/^[0-9+\s\-().]{8,20}$/.test(data.searchValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['searchValue'],
          message: 'Phone number must be between 8 and 20 digits',
        });
      }
    } else if (data.searchType === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.searchValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['searchValue'],
          message: 'Please enter a valid email address (e.g. guest@example.com)',
        });
      }
    } else if (data.searchType === 'code') {
      if (data.searchValue.length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['searchValue'],
          message: 'Booking code must be at least 4 characters (e.g. BK-...)',
        });
      }
    }
  });
