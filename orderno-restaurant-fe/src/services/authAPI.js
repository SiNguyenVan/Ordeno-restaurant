import axiosClient from './axiosClient';

export const authAPI = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  getMe: () => axiosClient.get('/auth/me'),
  logout: () => axiosClient.post('/auth/logout'),
};

export default authAPI;
