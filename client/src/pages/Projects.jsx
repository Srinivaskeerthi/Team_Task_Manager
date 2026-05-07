import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Grid3X3, List, Star, Calendar, Users, MoreHorizontal, Trash2, Edit, X } from 'lucide-react';
import { getProjectsAPI, createProjectAPI, deleteProjectAPI, toggleFavoriteAPI } from '../api/projects';
import { PRIORITY_COLORS, PROJECT_STATUS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { getInitials } from '../utils/helpers';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Projects() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium', status: 'planning', category: '', dueDate: '' });

  const fetchProjects = async () => {
    try {
      const { data } = await getProjectsAPI({ search: search || undefined });
      setProjects(data.projects);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProjectAPI(form);
      toast.success('Project created! 🎉');
      setShowCreate(false);
      setForm({ name: '', description: '', priority: 'medium', status: 'planning', category: '', dueDate: '' });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProjectAPI(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const handleFavorite = async (id) => {
    try {
      await toggleFavoriteAPI(id);
      fetchProjects();
    } catch (e) {}
  };

  const favorites = projects.filter(p => p.favoritedBy?.includes(user?._id));
  const others = projects.filter(p => !p.favoritedBy?.includes(user?._id));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><div className="h-8 w-48 rounded-lg bg-[var(--color-bg-tertiary)] animate-pulse" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-[var(--color-bg-tertiary)] animate-pulse" />)}
        </div>
      </div>
    );
  }

  const ProjectCard = ({ project }) => {
    const prio = PRIORITY_COLORS[project.priority] || PRIORITY_COLORS.medium;
    const status = PROJECT_STATUS[project.status] || PROJECT_STATUS.planning;
    const isFav = project.favoritedBy?.includes(user?._id);

    return (
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="glass rounded-2xl p-5 card-hover group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <Link to={`/projects/${project._id}`} className="text-lg font-semibold hover:text-[#7c5cfc] transition-colors truncate block">
              {project.name}
            </Link>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${status.bg} ${status.text}`}>{status.label}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleFavorite(project._id)} className={`p-1.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] ${isFav ? 'text-amber-400' : 'text-[var(--color-text-muted)]'}`}>
              <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            {(user?.role === 'admin' || project.owner?._id === user?._id) && (
              <button onClick={() => handleDelete(project._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{project.description || 'No description'}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--color-text-muted)' }}>Progress</span>
            <span className="font-medium">{project.progress || 0}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress || 0}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-[#7c5cfc] to-[#00d4ff]" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${prio.bg} ${prio.text}`}>{project.priority}</span>
          </div>
          <div className="flex -space-x-2">
            {project.members?.slice(0, 3).map((m, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center text-[10px] font-bold text-white border-2" style={{ borderColor: 'var(--color-bg-secondary)' }}>
                {getInitials(m.user?.name)}
              </div>
            ))}
            {project.members?.length > 3 && <div className="w-7 h-7 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[10px] font-medium border-2" style={{ borderColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>+{project.members.length - 3}</div>}
          </div>
        </div>

        {project.dueDate && (
          <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Calendar size={12} /> {formatDate(project.dueDate)}
          </div>
        )}

        {/* Manage button — always visible so users know to click */}
        <button
          onClick={() => navigate(`/projects/${project._id}`)}
          className="mt-4 w-full py-2 rounded-xl text-sm font-medium transition-all btn-primary flex items-center justify-center gap-2"
        >
          Manage →
        </button>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{projects.length} projects</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="input-field pl-9 py-2 w-full sm:w-56 text-sm" />
          </div>
          <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-[#7c5cfc]/15 text-[#7c5cfc]' : 'text-[var(--color-text-muted)]'}`}><Grid3X3 size={16} /></button>
            <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-[#7c5cfc]/15 text-[#7c5cfc]' : 'text-[var(--color-text-muted)]'}`}><List size={16} /></button>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}><Star size={14} className="text-amber-400" /> Favorites</h2>
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            <AnimatePresence>{favorites.map(p => <ProjectCard key={p._id} project={p} />)}</AnimatePresence>
          </div>
        </div>
      )}

      {/* All Projects */}
      <div>
        {favorites.length > 0 && <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>All Projects</h2>}
        {others.length === 0 && favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#7c5cfc]/10 flex items-center justify-center mx-auto mb-4"><Plus size={28} className="text-[#7c5cfc]" /></div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Create your first project to get started</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">Create Project</button>
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            <AnimatePresence>{others.map(p => <ProjectCard key={p._id} project={p} />)}</AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-strong rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">New Project</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Project Name *</label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" placeholder="My awesome project" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input-field min-h-[80px] resize-none" placeholder="What is this project about?" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Priority</label>
                    <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="input-field">
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Due Date</label>
                    <input type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Category</label>
                  <input value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input-field" placeholder="e.g., Development, Marketing" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Create Project</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
