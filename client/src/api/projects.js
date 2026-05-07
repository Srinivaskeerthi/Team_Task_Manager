import API from './axios';
export const getProjectsAPI = (params) => API.get('/projects', { params });
export const getProjectAPI = (id) => API.get(`/projects/${id}`);
export const createProjectAPI = (data) => API.post('/projects', data);
export const updateProjectAPI = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProjectAPI = (id) => API.delete(`/projects/${id}`);
export const addMemberAPI = (id, data) => API.post(`/projects/${id}/members`, data);
export const removeMemberAPI = (id, userId) => API.delete(`/projects/${id}/members/${userId}`);
export const toggleFavoriteAPI = (id) => API.put(`/projects/${id}/favorite`);
