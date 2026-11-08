import axiosClient from './axiosClient';

export const staffAPI = {
  getAll: (params) => axiosClient.get('/staff', { params }),
  getStats: () => axiosClient.get('/staff/stats'),
  getById: (id) => axiosClient.get(`/staff/${id}`),
  create: (data) => axiosClient.post('/staff', data),
  update: (id, data) => axiosClient.put(`/staff/${id}`, data),
  updateStatus: (id, status) => axiosClient.patch(`/staff/${id}/status`, { status }),
  delete: (id) => axiosClient.delete(`/staff/${id}`),
};

export default staffAPI;
