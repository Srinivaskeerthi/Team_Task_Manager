import Task from '../models/Task.js';
import User from '../models/User.js';

export const calculateProductivityScore = async (userId) => {
  const tasks = await Task.find({ assignedTo: userId });
  const completed = tasks.filter(t => t.status === 'completed');
  const total = tasks.length;
  if (total === 0) return 0;

  let score = 0;
  // Base: completion rate (max 50 points)
  score += (completed.length / total) * 50;

  // On-time bonus (max 30 points)
  const onTime = completed.filter(t => {
    if (!t.dueDate || !t.completedAt) return true;
    return new Date(t.completedAt) <= new Date(t.dueDate);
  });
  score += completed.length > 0 ? (onTime.length / completed.length) * 30 : 0;

  // Activity bonus (max 20 points based on recent activity)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const recentCompleted = completed.filter(t => t.completedAt && new Date(t.completedAt) >= lastWeek);
  score += Math.min(recentCompleted.length * 4, 20);

  const finalScore = Math.round(Math.min(score, 100));
  await User.findByIdAndUpdate(userId, { productivityScore: finalScore });
  return finalScore;
};

export const updateAllScores = async () => {
  const users = await User.find();
  for (const user of users) {
    await calculateProductivityScore(user._id);
  }
};
