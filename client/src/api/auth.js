import API from './axios';
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const getMeAPI = () => API.get('/auth/me');
export const logoutAPI = () => API.post('/auth/logout');
export const forgotPasswordAPI = (data) => API.post('/auth/forgot-password', data);
