import API from './axios';
export const getUsersAPI = () => API.get('/users');
export const getUserAPI = (id) => API.get(`/users/${id}`);
export const updateProfileAPI = (data) => API.put('/users/profile', data);
export const changePasswordAPI = (data) => API.put('/users/change-password', data);
export const updateRoleAPI = (id, data) => API.put(`/users/${id}/role`, data);
export const deleteUserAPI = (id) => API.delete(`/users/${id}`);
export const getUserStatsAPI = (id) => API.get(`/users/${id}/stats`);
