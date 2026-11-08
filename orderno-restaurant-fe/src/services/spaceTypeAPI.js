import axiosClient from './axiosClient';

/**
 * API service for Dining Spaces / Room Types (Single-Store Architecture)
 */
export const spaceTypeAPI = {
  /**
   * Public: Get list of all active dining room/space types
   */
  getAll: () => axiosClient.get('/space-types'),

  /**
   * Public / Admin: Get room type details by ID
   */
  getById: (id) => axiosClient.get(`/space-types/${id}`),

  /**
   * Admin: Get space types aggregate KPIs
   */
  getAdminStats: () => axiosClient.get('/space-types/admin/stats'),

  /**
   * Admin: Get all room types with filters & booking counts
   */
  getAdminList: (params) => axiosClient.get('/space-types/admin/list', { params }),

  /**
   * Admin: Create new space type
   */
  create: (data) => axiosClient.post('/space-types', data),

  /**
   * Admin: Update space type
   */
  update: (id, data) => axiosClient.put(`/space-types/${id}`, data),

  /**
   * Admin: Toggle space type availability
   */
  updateStatus: (id, is_active) =>
    axiosClient.patch(`/space-types/${id}/status`, { is_active }),

  /**
   * Admin: Soft-delete space type
   */
  delete: (id) => axiosClient.delete(`/space-types/${id}`),
};

// Convenient function exports
export const getSpaceTypes = spaceTypeAPI.getAll;
export const getSpaceTypeById = spaceTypeAPI.getById;

export default spaceTypeAPI;
