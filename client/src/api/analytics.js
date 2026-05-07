import API from './axios';
export const getDashboardStatsAPI = () => API.get('/analytics/dashboard');
export const getWeeklyProgressAPI = () => API.get('/analytics/weekly');
export const getTeamPerformanceAPI = () => API.get('/analytics/team');
export const getRecentActivityAPI = () => API.get('/analytics/activity');
export const getUpcomingDeadlinesAPI = () => API.get('/analytics/deadlines');
