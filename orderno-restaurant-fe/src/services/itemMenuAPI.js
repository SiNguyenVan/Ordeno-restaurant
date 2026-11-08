import axiosClient from './axiosClient';

export const itemMenuAPI = {
  /**
   * Get list of menu items with pagination and filters (Public):
   */
  getAll: (params) => axiosClient.get('/menu-items', { params }),

  /**
   * Get list of menu items for Admin (includes out-of-stock items, advanced filters)
   */
  getAllAdmin: (params) => axiosClient.get('/menu-items/admin/list', { params }),

  /**
   * Get admin menu statistics
   */
  getAdminStats: () => axiosClient.get('/menu-items/admin/stats'),

  /**
   * Get list of top best selling dishes
   */
  getTopBestSellers: (limit = 5) =>
    axiosClient.get('/menu-items/best-sellers', {
      params: { limit },
    }),

  /**
   * Get dish details by ID
   */
  getById: (id) => axiosClient.get(`/menu-items/${id}`),

  /**
   * Create new dish (Admin / Manager / Chef)
   */
  create: (data) => axiosClient.post('/menu-items', data),

  /**
   * Update dish (Admin / Manager / Chef)
   */
  update: (id, data) => axiosClient.put(`/menu-items/${id}`, data),

  /**
   * Toggle in-stock / out-of-stock availability
   */
  updateAvailability: (id, is_available) =>
    axiosClient.patch(`/menu-items/${id}/availability`, { is_available }),

  /**
   * Soft delete dish
   */
  delete: (id) => axiosClient.delete(`/menu-items/${id}`),

  /**
   * Get multiple dishes by their IDs in a single batch request
   */
  getBatchByIds: async (ids = []) => {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    try {
      const data = await axiosClient.post('/menu-items/batch', { ids });
      return Array.isArray(data) ? data : [];
    } catch (batchErr) {
      console.warn('Batch endpoint error, falling back to parallel requests:', batchErr);
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            return await axiosClient.get(`/menu-items/${id}`);
          } catch {
            return null;
          }
        })
      );
      return results.filter(Boolean);
    }
  },
};

export const menuItemAPI = itemMenuAPI;

export const getAllMenuItems = itemMenuAPI.getAll;
export const getTopBestSellers = itemMenuAPI.getTopBestSellers;
export const getMenuItemById = itemMenuAPI.getById;
export const getMenuItemsBatch = itemMenuAPI.getBatchByIds;

export default itemMenuAPI;
