import { Router } from 'express';
import { getDashboardStats, getWeeklyProgress, getTeamPerformance, getRecentActivity, getUpcomingDeadlines } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/weekly', getWeeklyProgress);
router.get('/team', getTeamPerformance);
router.get('/activity', getRecentActivity);
router.get('/deadlines', getUpcomingDeadlines);

export default router;
