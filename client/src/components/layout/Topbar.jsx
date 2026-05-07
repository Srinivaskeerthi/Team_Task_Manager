import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, X, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useNotificationStore from '../../store/notificationStore';
import { getNotificationsAPI, markReadAPI, markAllReadAPI } from '../../api/notifications';
import { formatRelative } from '../../utils/helpers';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/team': 'Team',
  '/settings': 'Settings',
  '/focus': 'Focus Mode',
};

export default function Topbar() {
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const { notifications, unreadCount, setNotifications, markRead, markAllRead } = useNotificationStore();

  const title = pageTitles[location.pathname] || (location.pathname.startsWith('/projects/') ? 'Project Detail' : '');

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await getNotificationsAPI();
        setNotifications(data.notifications, data.unreadCount);
      } catch (e) {}
    };
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try { await markReadAPI(id); markRead(id); } catch(e) {}
  };

  const handleMarkAllRead = async () => {
    try { await markAllReadAPI(); markAllRead(); } catch(e) {}
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search... (Ctrl+K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 pr-4 py-2 w-64 text-sm"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-all"
          >
            <Bell size={20} style={{ color: 'var(--color-text-secondary)' }} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 max-h-96 rounded-2xl overflow-hidden z-50 border shadow-2xl"
                  style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-[#7c5cfc] hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-72">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No notifications yet</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkRead(n._id)}
                          className={`p-3 border-b cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-all ${!n.read ? 'bg-[#7c5cfc]/5' : ''}`}
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{n.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{n.message}</p>
                          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{formatRelative(n.createdAt)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
