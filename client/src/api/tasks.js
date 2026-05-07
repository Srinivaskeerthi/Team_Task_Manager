import API from './axios';
export const getTasksAPI = (params) => API.get('/tasks', { params });
export const getTaskAPI = (id) => API.get(`/tasks/${id}`);
export const createTaskAPI = (data) => API.post('/tasks', data);
export const updateTaskAPI = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTaskAPI = (id) => API.delete(`/tasks/${id}`);
export const reorderTasksAPI = (data) => API.put('/tasks/reorder', data);
export const addCommentAPI = (id, data) => API.post(`/tasks/${id}/comments`, data);
export const updateChecklistAPI = (id, idx, data) => API.put(`/tasks/${id}/checklist/${idx}`, data);
