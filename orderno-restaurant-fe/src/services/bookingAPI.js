import axiosClient from './axiosClient';

/**
 * API service for Reservations & Party Bookings
 */
export const bookingAPI = {
  /**
   * Public: Lookup reservation by booking code
   */
  getByCode: (code) => axiosClient.get(`/bookings/code/${encodeURIComponent(code)}`),

  /**
   * Public: Lookup reservations by phone number or email address
   */
  lookup: (params) => axiosClient.get('/bookings/lookup', { params }),

  /**
   * Public: Create online reservation from customer portal
   */
  createPublic: (data) => axiosClient.post('/bookings', data),

  /**
   * Admin: Get reservation KPIs & aggregate metrics
   */
  getAdminStats: (params) => axiosClient.get('/bookings/admin/stats', { params }),

  /**
   * Admin: Get all reservations with filters & pre-ordered items
   */
  getAdminList: (params) => axiosClient.get('/bookings/admin/list', { params }),

  /**
   * Admin: Get reservation details by ID
   */
  getAdminById: (id) => axiosClient.get(`/bookings/admin/${id}`),

  /**
   * Admin: Create reservation from Admin/Concierge desk
   */
  createAdmin: (data) => axiosClient.post('/bookings/admin', data),

  /**
   * Admin: Update reservation details
   */
  updateAdmin: (id, data) => axiosClient.put(`/bookings/admin/${id}`, data),

  /**
   * Admin: Quick transition of reservation status & concierge note
   */
  updateStatus: (id, payload) => axiosClient.patch(`/bookings/admin/${id}/status`, payload),

  /**
   * Admin: Soft-delete reservation
   */
  deleteAdmin: (id) => axiosClient.delete(`/bookings/admin/${id}`),
};

export default bookingAPI;
