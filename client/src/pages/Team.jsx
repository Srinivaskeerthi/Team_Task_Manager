import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Crown, Medal, Award, Flame, Target, Shield } from 'lucide-react';
import { getTeamPerformanceAPI } from '../api/analytics';
import { getUsersAPI } from '../api/users';
import { getInitials } from '../utils/helpers';
import useAuthStore from '../store/authStore';

export default function Team() {
  const { user } = useAuthStore();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getTeamPerformanceAPI();
        setTeam(data.performance);
      } catch (e) {}
      setLoading(false);
    };
    fetch();
  }, []);

  const rankIcons = [
    <Crown className="text-amber-400" size={20} />,
    <Medal className="text-gray-300" size={20} />,
    <Award className="text-amber-600" size={20} />,
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 rounded bg-[var(--color-bg-tertiary)] animate-pulse" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[var(--color-bg-tertiary)] animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{team.length} members</p>
      </div>

      {/* Leaderboard */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Trophy size={20} className="text-amber-400" /> Leaderboard</h2>
        <div className="space-y-3">
          {team.map((member, i) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass rounded-2xl p-4 flex items-center gap-4 card-hover ${i === 0 ? 'border-amber-400/30' : ''}`}
            >
              {/* Rank */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: i < 3 ? ['#f59e0b15', '#d1d5db15', '#92400e15'][i] : 'var(--color-bg-tertiary)' }}>
                {i < 3 ? rankIcons[i] : <span className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>#{i + 1}</span>}
              </div>

              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {getInitials(member.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{member.name}</p>
                  {member.badges?.map((b, j) => (
                    <span key={j} title={b.name} className="text-sm">{b.icon}</span>
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {member.completedTasks} tasks completed · {member.completionRate}% rate
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="text-center hidden sm:block">
                  <div className="flex items-center gap-1 text-orange-400"><Flame size={14} /><span className="text-sm font-bold">{member.streakCount}</span></div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Streak</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-[#7c5cfc]"><Target size={14} /><span className="text-sm font-bold">{member.productivityScore}</span></div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Score</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Member Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users size={20} className="text-[#00d4ff]" /> All Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {team.map((member, i) => (
            <motion.div key={member._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center text-sm font-bold text-white">
                  {getInitials(member.name)}
                </div>
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <div className="flex items-center gap-1">
                    <Shield size={12} className="text-[#7c5cfc]" />
                    <span className="text-xs capitalize" style={{ color: 'var(--color-text-muted)' }}>Member</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-xl" style={{ background: 'var(--color-bg-tertiary)' }}>
                  <p className="text-lg font-bold text-[#7c5cfc]">{member.totalTasks}</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Total</p>
                </div>
                <div className="p-2 rounded-xl" style={{ background: 'var(--color-bg-tertiary)' }}>
                  <p className="text-lg font-bold text-[#10b981]">{member.completedTasks}</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Done</p>
                </div>
                <div className="p-2 rounded-xl" style={{ background: 'var(--color-bg-tertiary)' }}>
                  <p className="text-lg font-bold text-[#00d4ff]">{member.completionRate}%</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Rate</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
