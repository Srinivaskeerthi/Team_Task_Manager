import User from '../models/User.js';
import Task from '../models/Task.js';

export const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = new Date(user.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

  // Check if user completed at least one task today
  const todayStart = new Date(today);
  const todayEnd = new Date(today);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const completedToday = await Task.countDocuments({
    assignedTo: userId,
    completedAt: { $gte: todayStart, $lt: todayEnd },
  });

  if (completedToday > 0) {
    if (diffDays <= 1) {
      user.streakCount = diffDays === 0 ? user.streakCount : user.streakCount + 1;
    } else {
      user.streakCount = 1; // Reset streak
    }
    user.lastActiveDate = new Date();

    // Award badges for streak milestones
    const milestones = [
      { days: 3, name: 'Streak Starter', icon: '🔥' },
      { days: 7, name: 'Week Warrior', icon: '⚡' },
      { days: 14, name: 'Consistency King', icon: '👑' },
      { days: 30, name: 'Monthly Master', icon: '🏆' },
    ];

    for (const m of milestones) {
      if (user.streakCount >= m.days && !user.badges.some(b => b.name === m.name)) {
        user.badges.push({ name: m.name, icon: m.icon });
      }
    }

    await user.save();
  }

  return { streakCount: user.streakCount, badges: user.badges };
};
