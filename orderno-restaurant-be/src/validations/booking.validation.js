const { z } = require('zod');

const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'];
const BOOKING_TYPES = ['REGULAR_TABLE', 'PARTY_EVENT', 'DELIVERY'];

const bookingItemSchema = z.object({
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

const baseBookingSchema = z.object({
  booking_type: z
    .enum(BOOKING_TYPES, {
      errorMap: () => ({
        message: 'Booking type must be REGULAR_TABLE, PARTY_EVENT, or DELIVERY',
      }),
    })
    .optional()
    .default('REGULAR_TABLE'),

  space_type_id: z
    .union([z.coerce.number().int().positive(), z.literal(''), z.null()])
    .optional()
    .nullable()
    .transform((val) => (val === '' || val === null || val === undefined ? null : Number(val))),

  rooms_requested: z.coerce
    .number()
    .int()
    .min(1, 'Rooms requested must be at least 1')
    .max(20, 'Rooms requested cannot exceed 20')
    .optional()
    .default(1),

  customer_name: z
    .string({ required_error: 'Customer name is required' })
    .trim()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name cannot exceed 100 characters'),

  customer_phone: z
    .string({ required_error: 'Customer phone is required' })
    .trim()
    .regex(/^[0-9+\s\-().]{8,20}$/, 'Phone number must be between 8 and 20 digits'),

  customer_email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' || val === null || val === undefined ? null : val))
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Please enter a valid email address'
    ),

  booking_date: z
    .string({ required_error: 'Booking date is required' })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Booking date must be in YYYY-MM-DD format'),

  booking_time: z
    .string({ required_error: 'Booking time is required' })
    .trim()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
      'Booking time must be in HH:mm or HH:mm:ss format'
    ),

  duration_minutes: z.coerce
    .number()
    .int()
    .min(30, 'Duration must be at least 30 minutes')
    .max(480, 'Duration cannot exceed 480 minutes')
    .optional()
    .default(120),

  guest_adults: z.coerce
    .number({ required_error: 'Number of adult guests is required' })
    .int()
    .min(1, 'At least 1 adult guest is required')
    .max(500, 'Adult guests cannot exceed 500')
    .default(2),

  guest_children: z.coerce
    .number()
    .int()
    .min(0, 'Number of children cannot be negative')
    .max(200, 'Children count cannot exceed 200')
    .optional()
    .default(0),

  event_type: z
    .string()
    .trim()
    .max(150, 'Event type cannot exceed 150 characters')
    .optional()
    .nullable(),

  special_requests: z
    .string()
    .trim()
    .max(1000, 'Special requests cannot exceed 1000 characters')
    .optional()
    .nullable(),

  status: z
    .enum(BOOKING_STATUSES, {
      errorMap: () => ({ message: 'Invalid reservation status' }),
    })
    .optional()
    .default('PENDING'),

  admin_note: z
    .string()
    .trim()
    .max(1000, 'Admin note cannot exceed 1000 characters')
    .optional()
    .nullable(),

  items: z.array(bookingItemSchema).optional().default([]),
});

const createBookingSchema = baseBookingSchema
  .superRefine((data, ctx) => {
    if (data.booking_type !== 'DELIVERY' && !data.space_type_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['space_type_id'],
        message: 'Please select a valid dining space',
      });
    }
  })
  .transform((data) => ({
    ...data,
    space_type_id: data.booking_type === 'DELIVERY' ? null : data.space_type_id,
  }));

const updateBookingSchema = baseBookingSchema.partial().extend({
  replace_items: z.boolean().optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES, {
    required_error: 'Reservation status is required',
    errorMap: () => ({
      message: 'Status must be one of PENDING, CONFIRMED, SEATED, COMPLETED, CANCELLED',
    }),
  }),
  admin_note: z.string().trim().optional().nullable(),
});

const lookupBookingQuerySchema = z
  .object({
    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => !val || /^[0-9+\s\-().]{8,20}$/.test(val),
        'Phone number must be between 8 and 20 digits'
      ),
    email: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        'Please enter a valid email address'
      ),
    identifier: z
      .string()
      .trim()
      .optional()
      .or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    const hasPhone = Boolean(data.phone && data.phone.trim() !== '');
    const hasEmail = Boolean(data.email && data.email.trim() !== '');
    const hasId = Boolean(data.identifier && data.identifier.trim() !== '');
    if (!hasPhone && !hasEmail && !hasId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identifier'],
        message: 'Please provide either a phone number or email address to look up your reservation',
      });
    }
  });

module.exports = {
  BOOKING_STATUSES,
  BOOKING_TYPES,
  createBookingSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
  lookupBookingQuerySchema,
};
