import axiosClient from './axiosClient';

/**
 * API service for Menu Categories
 */
export const categoryAPI = {
  /**
   * Get list of categories with total items count
   */
  getAll: () => axiosClient.get('/categories'),

  /**
   * Get category details by ID or Slug
   */
  getById: (idOrSlug) => axiosClient.get(`/categories/${idOrSlug}`),

  /**
   * Create new category (Admin / Manager)
   */
  create: (data) => axiosClient.post('/categories', data),

  /**
   * Update category
   */
  update: (id, data) => axiosClient.put(`/categories/${id}`, data),

  /**
   * Delete category
   */
  delete: (id) => axiosClient.delete(`/categories/${id}`),
};

export const getCategories = categoryAPI.getAll;
export const getCategoryById = categoryAPI.getById;

export default categoryAPI;
