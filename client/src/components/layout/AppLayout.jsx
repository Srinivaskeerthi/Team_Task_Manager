import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useUIStore from '../../store/uiStore';
import { useSocket } from '../../hooks/useSocket';

export default function AppLayout({ children }) {
  const { sidebarOpen } = useUIStore();
  useSocket();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 260 : 76 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen flex flex-col"
      >
        <Topbar />
        <motion.main
          key={children?.type?.name || 'page'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-6"
        >
          {children}
        </motion.main>
      </motion.div>
    </div>
  );
}
