import API from './axios';
export const getNotificationsAPI = () => API.get('/notifications');
export const markReadAPI = (id) => API.put(`/notifications/${id}/read`);
export const markAllReadAPI = () => API.put('/notifications/read-all');
export const deleteNotificationAPI = (id) => API.delete(`/notifications/${id}`);
