import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userProjects = await Project.find({ $or: [{ owner: userId }, { 'members.user': userId }] }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const totalProjects = userProjects.length;
    const allTasks = await Task.find({ project: { $in: projectIds } });
    const myTasks = await Task.find({ assignedTo: userId });

    const now = new Date();
    const stats = {
      totalProjects,
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === 'completed').length,
      pendingTasks: allTasks.filter(t => t.status !== 'completed').length,
      inProgressTasks: allTasks.filter(t => t.status === 'in-progress').length,
      reviewTasks: allTasks.filter(t => t.status === 'review').length,
      todoTasks: allTasks.filter(t => t.status === 'todo').length,
      overdueTasks: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length,
      myTotalTasks: myTasks.length,
      myCompletedTasks: myTasks.filter(t => t.status === 'completed').length,
    };

    res.status(200).json({ success: true, stats });
  } catch (error) { next(error); }
};

export const getWeeklyProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = 7;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const completed = await Task.countDocuments({
        assignedTo: userId,
        completedAt: { $gte: date, $lt: nextDate },
      });
      const created = await Task.countDocuments({
        createdBy: userId,
        createdAt: { $gte: date, $lt: nextDate },
      });

      data.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        completed,
        created,
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getTeamPerformance = async (req, res, next) => {
  try {
    const users = await User.find().select('name avatar productivityScore streakCount badges');
    const performance = await Promise.all(users.map(async (user) => {
      const tasks = await Task.find({ assignedTo: user._id });
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = tasks.length;
      return {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        productivityScore: user.productivityScore,
        streakCount: user.streakCount,
        badges: user.badges,
        completedTasks: completed,
        totalTasks: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }));

    performance.sort((a, b) => b.completedTasks - a.completedTasks);
    res.status(200).json({ success: true, performance });
  } catch (error) { next(error); }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userProjects = await Project.find({ $or: [{ owner: userId }, { 'members.user': userId }] }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const activities = await Activity.find({ project: { $in: projectIds } })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, activities });
  } catch (error) { next(error); }
};

export const getUpcomingDeadlines = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tasks = await Task.find({
      assignedTo: userId,
      status: { $ne: 'completed' },
      dueDate: { $gte: now, $lte: nextWeek },
    })
      .populate('project', 'name')
      .sort({ dueDate: 1 })
      .limit(10);

    res.status(200).json({ success: true, tasks });
  } catch (error) { next(error); }
};
