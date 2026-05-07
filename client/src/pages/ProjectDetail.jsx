import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, X, Calendar, User, MessageSquare, CheckSquare, Trash2, ArrowLeft, UserPlus } from 'lucide-react';
import { getProjectAPI, addMemberAPI, removeMemberAPI } from '../api/projects';
import { getUsersAPI } from '../api/users';
import { createTaskAPI, updateTaskAPI, deleteTaskAPI, reorderTasksAPI, addCommentAPI } from '../api/tasks';
import { PRIORITY_COLORS, STATUS_COLORS, TASK_STATUSES } from '../utils/constants';
import { formatDate, getInitials, isOverdue } from '../utils/helpers';
import { useSocket } from '../hooks/useSocket';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#8888a0' },
  { id: 'in-progress', label: 'In Progress', color: '#00d4ff' },
  { id: 'review', label: 'Review', color: '#7c5cfc' },
  { id: 'completed', label: 'Completed', color: '#10b981' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { joinProject, leaveProject } = useSocket();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });
  const [comment, setComment] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await getProjectAPI(id);
      setProject(data.project);
      setTasks(data.project.tasks || []);
    } catch (e) { toast.error('Project not found'); navigate('/projects'); }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchProject();
    joinProject(id);
    return () => leaveProject(id);
  }, [id]);

  // Fetch all users for add-member dropdown (admin only)
  useEffect(() => {
    getUsersAPI().then(r => setAllUsers(r.data.users || [])).catch(() => {});
  }, []);

  // Is current user the project admin?
  const isAdmin = project?.myRole === 'admin';

  const getColumnTasks = (status) => tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newTasks = [...tasks];
    const task = newTasks.find(t => t._id === draggableId);
    if (!task) return;

    // Members may only drag tasks assigned to themselves
    if (!isAdmin) {
      const assignedId = task.assignedTo?._id || task.assignedTo;
      if (!assignedId || assignedId.toString() !== user?._id?.toString()) {
        toast.error('You can only move tasks assigned to you');
        return;
      }
    }

    task.status = destination.droppableId;
    const colTasks = newTasks.filter(t => t.status === destination.droppableId && t._id !== draggableId);
    colTasks.splice(destination.index, 0, task);
    colTasks.forEach((t, i) => t.order = i);

    setTasks(newTasks);

    try {
      await reorderTasksAPI({ tasks: colTasks.map((t, i) => ({ _id: t._id, status: t.status, order: i })) });
      if (source.droppableId !== destination.droppableId) {
        await updateTaskAPI(draggableId, { status: destination.droppableId });
      }
    } catch (e) { fetchProject(); }
  };

  const handleAddTask = async (status) => {
    if (!newTask.title.trim()) return;
    try {
      await createTaskAPI({ ...newTask, project: id, status });
      toast.success('Task created');
      setNewTask({ title: '', priority: 'medium' });
      setShowAddTask(null);
      fetchProject();
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to create task'); }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      await addMemberAPI(id, { userId: selectedUserId });
      toast.success('Member added!');
      setSelectedUserId('');
      setShowAddMember(false);
      fetchProject();
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMemberAPI(id, userId);
      toast.success('Member removed');
      fetchProject();
    } catch (e) { toast.error('Failed to remove member'); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTaskAPI(taskId);
      toast.success('Task deleted');
      setSelectedTask(null);
      fetchProject();
    } catch (e) { toast.error('Failed'); }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedTask) return;
    try {
      const { data } = await addCommentAPI(selectedTask._id, { content: comment });
      setSelectedTask({ ...selectedTask, comments: [data.comment, ...(selectedTask.comments || [])] });
      setComment('');
    } catch (e) { toast.error('Failed to add comment'); }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const { data } = await updateTaskAPI(taskId, updates);
      setSelectedTask(data.task);
      fetchProject();
    } catch (e) { toast.error('Failed to update'); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-[var(--color-bg-tertiary)] animate-pulse" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-96 rounded-2xl bg-[var(--color-bg-tertiary)] animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate('/projects')} className="p-2 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{project?.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: isAdmin ? 'rgba(124,92,252,0.15)' : 'rgba(0,212,255,0.12)', color: isAdmin ? '#7c5cfc' : '#00d4ff' }}>
              {isAdmin ? '👑 Admin' : '🧑‍💻 Member'}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{project?.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project?.members?.slice(0, 5).map((m, i) => (
              <div key={i} title={m.user?.name} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center text-xs font-bold text-white border-2" style={{ borderColor: 'var(--color-bg-primary)' }}>
                {getInitials(m.user?.name)}
              </div>
            ))}
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddMember(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium btn-primary">
              <UserPlus size={14} /> Add Member
            </button>
          )}
          <div className="text-sm px-3 py-1 rounded-full" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
            {project?.progress || 0}% complete
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowAddMember(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Add Member</h3>
                <button onClick={() => setShowAddMember(false)} className="p-1 rounded-lg hover:bg-[var(--color-bg-tertiary)]"><X size={16} /></button>
              </div>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="input-field mb-4">
                <option value="">Select a user...</option>
                {allUsers.filter(u => !project?.members?.some(m => m.user?._id === u._id)).map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <div className="mb-4">
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Current Members:</p>
                {project?.members?.map(m => (
                  <div key={m.user?._id} className="flex items-center justify-between py-1.5">
                    <span className="text-sm">{m.user?.name} <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>({m.role})</span></span>
                    {m.role !== 'admin' && (
                      <button onClick={() => handleRemoveMember(m.user?._id)} className="text-xs text-red-400 hover:underline">Remove</button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleAddMember} disabled={!selectedUserId} className="btn-primary w-full py-2 text-sm">Add to Project</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = getColumnTasks(col.id);
            return (
              <div key={col.id} className="flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-sm font-semibold">{col.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>{colTasks.length}</span>
                  </div>
                  {isAdmin && <button onClick={() => setShowAddTask(col.id)} className="p-1 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"><Plus size={16} /></button>}
                </div>

                {/* Droppable */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[200px] p-2 rounded-2xl space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-[#7c5cfc]/5 border-2 border-dashed border-[#7c5cfc]/30' : ''}`}
                      style={{ background: snapshot.isDraggingOver ? undefined : 'var(--color-bg-secondary)', border: snapshot.isDraggingOver ? undefined : '1px solid var(--color-border)' }}
                    >
                      {/* Add Task Form */}
                      <AnimatePresence>
                        {showAddTask === col.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 rounded-xl" style={{ background: 'var(--color-bg-tertiary)' }}>
                            <input autoFocus value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} placeholder="Task title..." className="input-field text-sm mb-2" onKeyDown={(e) => e.key === 'Enter' && handleAddTask(col.id)} />
                            <div className="flex gap-2">
                              <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className="input-field text-xs py-1 flex-1">
                                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                              </select>
                              <button onClick={() => handleAddTask(col.id)} className="btn-primary text-xs py-1 px-3">Add</button>
                              <button onClick={() => setShowAddTask(null)} className="p-1 rounded hover:bg-[var(--color-bg-secondary)]"><X size={14} /></button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Task Cards */}
                      {colTasks.map((task, index) => {
                        const prio = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                        return (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedTask(task)}
                                className={`p-3 rounded-xl cursor-pointer group transition-all ${snapshot.isDragging ? 'shadow-lg shadow-[#7c5cfc]/20 rotate-2' : 'hover:border-[#7c5cfc]/30'}`}
                                style={{
                                  ...provided.draggableProps.style,
                                  background: 'var(--color-bg-tertiary)',
                                  border: '1px solid var(--color-border)',
                                }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-sm font-medium flex-1 pr-2">{task.title}</h4>
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${prio.dot}`} />
                                </div>

                                {task.description && <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{task.description}</p>}

                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    {task.dueDate && (
                                      <span className={`text-[10px] flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
                                        <Calendar size={10} /> {formatDate(task.dueDate)}
                                      </span>
                                    )}
                                  </div>
                                  {task.assignedTo && (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center text-[9px] font-bold text-white">
                                      {getInitials(task.assignedTo?.name)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setSelectedTask(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {isAdmin ? (
                      <input
                        value={selectedTask.title}
                        onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                        onBlur={() => handleUpdateTask(selectedTask._id, { title: selectedTask.title })}
                        className="text-xl font-bold bg-transparent border-none outline-none w-full"
                      />
                    ) : (
                      <h3 className="text-xl font-bold">{selectedTask.title}</h3>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isAdmin && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
                        🧑‍💻 Member View
                      </span>
                    )}
                    {isAdmin && <button onClick={() => handleDeleteTask(selectedTask._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={16} /></button>}
                    <button onClick={() => setSelectedTask(null)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]"><X size={16} /></button>
                  </div>
                </div>

                {/* Task meta — admins see all fields, members only see status */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                    <select value={selectedTask.status} onChange={(e) => handleUpdateTask(selectedTask._id, { status: e.target.value })} className="input-field text-sm">
                      {TASK_STATUSES.map(s => <option key={s} value={s}>{STATUS_COLORS[s]?.label}</option>)}
                    </select>
                  </div>
                  {isAdmin && (
                    <div>
                      <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Priority</label>
                      <select value={selectedTask.priority} onChange={(e) => handleUpdateTask(selectedTask._id, { priority: e.target.value })} className="input-field text-sm">
                        {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  )}
                  {isAdmin && (
                    <div>
                      <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Due Date</label>
                      <input type="date" value={selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : ''} onChange={(e) => handleUpdateTask(selectedTask._id, { dueDate: e.target.value })} className="input-field text-sm" />
                    </div>
                  )}
                  {isAdmin && (
                    <div>
                      <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Assignee</label>
                      <select value={selectedTask.assignedTo?._id || ''} onChange={(e) => handleUpdateTask(selectedTask._id, { assignedTo: e.target.value || null })} className="input-field text-sm">
                        <option value="">Unassigned</option>
                        {project?.members?.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Description</label>
                  {isAdmin ? (
                    <textarea
                      value={selectedTask.description || ''}
                      onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                      onBlur={() => handleUpdateTask(selectedTask._id, { description: selectedTask.description })}
                      className="input-field min-h-[80px] resize-none text-sm"
                      placeholder="Add a description..."
                    />
                  ) : (
                    <p className="text-sm p-3 rounded-xl min-h-[80px]" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                      {selectedTask.description || <span style={{ color: 'var(--color-text-muted)' }}>No description.</span>}
                    </p>
                  )}
                </div>

                {/* Checklist */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><CheckSquare size={14} /> Checklist</h4>
                  {(selectedTask.checklist || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <input type="checkbox" checked={item.completed} onChange={() => {}} className="accent-[#7c5cfc]" />
                      <span className={`text-sm ${item.completed ? 'line-through opacity-50' : ''}`}>{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Comments */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><MessageSquare size={14} /> Comments</h4>
                  <div className="flex gap-2 mb-4">
                    <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." className="input-field text-sm flex-1" onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
                    <button onClick={handleAddComment} className="btn-primary text-sm px-4">Send</button>
                  </div>
                  <div className="space-y-3">
                    {(selectedTask.comments || []).map((c) => (
                      <div key={c._id} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--color-bg-tertiary)' }}>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                          {getInitials(c.author?.name)}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{c.author?.name}</p>
                          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
