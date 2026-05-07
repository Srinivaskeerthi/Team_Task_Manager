import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, Clock, AlertTriangle, TrendingUp, Flame, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getDashboardStatsAPI, getWeeklyProgressAPI, getRecentActivityAPI, getUpcomingDeadlinesAPI } from '../api/analytics';
import useAuthStore from '../store/authStore';
import { getGreeting, formatRelative, formatDate, isOverdue } from '../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass rounded-2xl p-5 card-hover"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, weeklyRes, actRes, deadRes] = await Promise.all([
          getDashboardStatsAPI(),
          getWeeklyProgressAPI(),
          getRecentActivityAPI(),
          getUpcomingDeadlinesAPI(),
        ]);
        setStats(statsRes.data.stats);
        setWeeklyData(weeklyRes.data.data);
        setActivities(actRes.data.activities);
        setDeadlines(deadRes.data.tasks);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 rounded-xl bg-[var(--color-bg-tertiary)] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-[var(--color-bg-tertiary)] animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-72 rounded-2xl bg-[var(--color-bg-tertiary)] animate-pulse" />)}
        </div>
      </div>
    );
  }

  const actionMap = {
    created_project: '📁 Created project', updated_project: '✏️ Updated project', completed_task: '✅ Completed task',
    created_task: '📝 Created task', updated_task: '✏️ Updated task', commented: '💬 Commented',
    moved_task: '↔️ Moved task', assigned_task: '👤 Assigned task', invited_member: '➕ Invited member',
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">{getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Here's what's happening with your projects today</p>
      </motion.div>

      {/* Streak & Score */}
      <div className="flex gap-4 flex-wrap">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
          <Flame size={18} className="text-orange-400" />
          <span className="text-sm font-medium">{user?.streakCount || 0} day streak</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
          <Target size={18} className="text-[#7c5cfc]" />
          <span className="text-sm font-medium">Score: {user?.productivityScore || 0}/100</span>
        </motion.div>
        {user?.badges?.map((b, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * (i + 2) }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-sm">
            <span>{b.icon}</span> {b.name}
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Total Projects" value={stats?.totalProjects || 0} color="#7c5cfc" delay={0.1} />
        <StatCard icon={CheckCircle} label="Completed Tasks" value={stats?.completedTasks || 0} color="#10b981" delay={0.15} />
        <StatCard icon={Clock} label="In Progress" value={stats?.inProgressTasks || 0} color="#00d4ff" delay={0.2} />
        <StatCard icon={AlertTriangle} label="Overdue Tasks" value={stats?.overdueTasks || 0} color="#ef4444" delay={0.25} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#7c5cfc]" /> Weekly Progress
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fill: '#8888a0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8888a0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: '12px', color: '#f1f1f3' }}
              />
              <Bar dataKey="completed" fill="#7c5cfc" radius={[6, 6, 0, 0]} name="Completed" />
              <Bar dataKey="created" fill="#00d4ff" radius={[6, 6, 0, 0]} name="Created" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Task Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Task Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'To Do', value: stats?.todoTasks || 0, total: stats?.totalTasks || 1, color: '#8888a0' },
              { label: 'In Progress', value: stats?.inProgressTasks || 0, total: stats?.totalTasks || 1, color: '#00d4ff' },
              { label: 'Review', value: stats?.reviewTasks || 0, total: stats?.totalTasks || 1, color: '#7c5cfc' },
              { label: 'Completed', value: stats?.completedTasks || 0, total: stats?.totalTasks || 1, color: '#10b981' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / item.total) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>No recent activity</p>
            ) : activities.map((a) => (
              <div key={a._id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {a.user?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{a.user?.name}</span>{' '}
                    <span style={{ color: 'var(--color-text-secondary)' }}>{actionMap[a.action] || a.action}</span>
                  </p>
                  {a.details?.taskTitle && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{a.details.taskTitle}</p>}
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{formatRelative(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {deadlines.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>No upcoming deadlines 🎉</p>
            ) : deadlines.map((t) => (
              <div key={t._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOverdue(t.dueDate) ? 'bg-red-400' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.project?.name}</p>
                </div>
                <span className={`text-xs font-medium ${isOverdue(t.dueDate) ? 'text-red-400' : 'text-amber-400'}`}>
                  {formatDate(t.dueDate)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
