const BookingService = require('../services/Booking.service');

const BookingController = {
  getAdminStats: async (req, res, next) => {
    try {
      const { booking_date } = req.query;
      const stats = await BookingService.getAdminStats({ booking_date });
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  getAdminList: async (req, res, next) => {
    try {
      const { search, space_type_id, status, booking_type, booking_date } = req.query;
      const bookings = await BookingService.getAdminList({
        search,
        space_type_id,
        status,
        booking_type,
        booking_date,
      });
      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const booking = await BookingService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },

  getByCode: async (req, res, next) => {
    try {
      const booking = await BookingService.getByCode(req.params.code);
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },

  lookupBookings: async (req, res, next) => {
    try {
      const { phone, email, identifier } = req.query;
      const bookings = await BookingService.lookupByContact({ phone, email, identifier });
      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  },

  createBooking: async (req, res, next) => {
    try {
      const created = await BookingService.createBooking(req.body);
      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  },

  updateBooking: async (req, res, next) => {
    try {
      const updated = await BookingService.updateBooking(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Reservation updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { status, admin_note } = req.body;
      const updated = await BookingService.updateStatus(req.params.id, status, admin_note);
      res.status(200).json({
        success: true,
        message: `Reservation status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteBooking: async (req, res, next) => {
    try {
      const result = await BookingService.deleteBooking(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = BookingController;
