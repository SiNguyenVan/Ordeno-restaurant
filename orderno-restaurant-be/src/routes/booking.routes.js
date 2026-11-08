const { Router } = require('express');
const BookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validateBody, validateQuery } = require('../middlewares/validate.middleware');
const {
  createBookingSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
  lookupBookingQuerySchema,
} = require('../validations/booking.validation');

const router = Router();

const staffAndAdminRoles = roleMiddleware(
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'STAFF',
  'WAITER',
  'CASHIER',
  'CHEF'
);
const managerAndAboveRoles = roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MANAGER');

// ==================== ADMIN ROUTES ====================

// GET /api/bookings/admin/stats - Reservation statistics & KPIs
router.get('/admin/stats', authMiddleware, staffAndAdminRoles, BookingController.getAdminStats);

// GET /api/bookings/admin/list - Reservation list with filters
router.get('/admin/list', authMiddleware, staffAndAdminRoles, BookingController.getAdminList);

// GET /api/bookings/admin/:id - Reservation details by ID
router.get('/admin/:id', authMiddleware, staffAndAdminRoles, BookingController.getById);

// POST /api/bookings/admin - Create reservation from Admin/Concierge
router.post(
  '/admin',
  authMiddleware,
  staffAndAdminRoles,
  validateBody(createBookingSchema),
  BookingController.createBooking
);

// PUT /api/bookings/admin/:id - Update reservation details
router.put(
  '/admin/:id',
  authMiddleware,
  staffAndAdminRoles,
  validateBody(updateBookingSchema),
  BookingController.updateBooking
);

// PATCH /api/bookings/admin/:id/status - Quick status transition
router.patch(
  '/admin/:id/status',
  authMiddleware,
  staffAndAdminRoles,
  validateBody(updateBookingStatusSchema),
  BookingController.updateStatus
);

// DELETE /api/bookings/admin/:id - Soft-delete reservation
router.delete(
  '/admin/:id',
  authMiddleware,
  managerAndAboveRoles,
  BookingController.deleteBooking
);

// ==================== PUBLIC ROUTES ====================

// GET /api/bookings/lookup - Customer reservation lookup by phone or email
router.get('/lookup', validateQuery(lookupBookingQuerySchema), BookingController.lookupBookings);

// GET /api/bookings/code/:code - Lookup reservation by booking_code
router.get('/code/:code', BookingController.getByCode);

// POST /api/bookings - Customer online table/event reservation
router.post('/', validateBody(createBookingSchema), BookingController.createBooking);

module.exports = router;
