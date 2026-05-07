import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import { getIO } from '../config/socket.js';

// ─── Project-level role helper ─────────────────────────────────────────────────
/**
 * Returns 'admin' | 'member' | null for the given user within a project.
 * Accepts either a projectId string/ObjectId, or a pre-fetched project with .members.
 */
const getProjectRole = async (projectId, userId) => {
  const project = await Project.findById(projectId).select('members');
  if (!project) return null;
  const member = project.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// @desc    Create task — project admin only
// @route   POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const role = await getProjectRole(req.body.project, req.user._id);

    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the project admin can create tasks',
      });
    }

    const taskData = { ...req.body, createdBy: req.user._id };
    const maxOrder = await Task.findOne({
      project: req.body.project,
      status: req.body.status || 'todo',
    }).sort({ order: -1 });
    taskData.order = maxOrder ? maxOrder.order + 1 : 0;

    const task = await Task.create(taskData);
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    await Activity.create({
      user: req.user._id,
      action: 'created_task',
      entityType: 'task',
      entityId: task._id,
      project: task.project,
      details: { taskTitle: task.title },
    });

    // Notify the assigned member
    if (task.assignedTo && task.assignedTo._id.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: task.assignedTo._id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to "${task.title}"`,
        link: `/projects/${task.project}`,
      });
    }

    try { getIO().to(`project:${task.project}`).emit('task:created', task); } catch(e) {}

    res.status(201).json({ success: true, task });
  } catch (error) { next(error); }
};

// @desc    Get tasks (filtered by project/status/priority etc.)
// @route   GET /api/tasks
export const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, assignedTo, search, sort } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    let sortObj = { order: 1, createdAt: -1 };
    if (sort === 'dueDate') sortObj = { dueDate: 1 };
    if (sort === 'priority') sortObj = { priority: -1 };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort(sortObj);

    res.status(200).json({ success: true, tasks });
  } catch (error) { next(error); }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Must be a project member to view
    const role = await getProjectRole(task.project, req.user._id);
    if (!role) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project' });
    }

    const comments = await Comment.find({ task: task._id })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });

    const taskObj = task.toObject();
    taskObj.comments = comments;

    res.status(200).json({ success: true, task: taskObj });
  } catch (error) { next(error); }
};

// @desc    Update task
//   - Project Admin  → can update everything (title, assignee, priority, etc.)
//   - Project Member → can ONLY update status of tasks assigned to them
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const role = await getProjectRole(task.project, req.user._id);

    if (!role) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project' });
    }

    if (role === 'member') {
      // Members can only update status of tasks assigned to them
      const isAssignedToMe =
        task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

      if (!isAssignedToMe) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update tasks assigned to them',
        });
      }

      // Whitelist — members may only send { status }
      const allowedFields = ['status'];
      const hasDisallowedField = Object.keys(req.body).some(
        (f) => !allowedFields.includes(f)
      );

      if (hasDisallowedField) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update task status',
        });
      }
    }

    const oldStatus = task.status;
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (req.body.status === 'completed' && oldStatus !== 'completed') {
      task.completedAt = new Date();
      await task.save();
      await Activity.create({
        user: req.user._id,
        action: 'completed_task',
        entityType: 'task',
        entityId: task._id,
        project: task.project,
        details: { taskTitle: task.title },
      });
    } else {
      await Activity.create({
        user: req.user._id,
        action: 'updated_task',
        entityType: 'task',
        entityId: task._id,
        project: task.project,
        details: { taskTitle: task.title, changes: Object.keys(req.body) },
      });
    }

    try { getIO().to(`project:${task.project}`).emit('task:updated', task); } catch(e) {}

    res.status(200).json({ success: true, task });
  } catch (error) { next(error); }
};

// @desc    Delete task — project admin only
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const role = await getProjectRole(task.project, req.user._id);
    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the project admin can delete tasks',
      });
    }

    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(req.params.id);

    try { getIO().to(`project:${task.project}`).emit('task:deleted', req.params.id); } catch(e) {}

    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) { next(error); }
};

// @desc    Reorder tasks via drag-and-drop
//   - Project Admin → full reorder of any column
//   - Project Member → can only reorder their own assigned tasks (status update only)
// @route   PUT /api/tasks/reorder
export const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, message: 'tasks array is required' });
    }

    // Derive project from the first task to check membership
    const firstTask = await Task.findById(tasks[0]._id).select('project assignedTo');
    if (!firstTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const role = await getProjectRole(firstTask.project, req.user._id);
    if (!role) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project' });
    }

    if (role === 'member') {
      // Members may only move tasks assigned to themselves
      const myId = req.user._id.toString();
      const taskDocs = await Task.find({
        _id: { $in: tasks.map((t) => t._id) },
      }).select('assignedTo');

      const allMine = taskDocs.every(
        (t) => t.assignedTo && t.assignedTo.toString() === myId
      );

      if (!allMine) {
        return res.status(403).json({
          success: false,
          message: 'Members can only move tasks assigned to them',
        });
      }
    }

    const bulkOps = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t._id },
        update: { status: t.status, order: t.order },
      },
    }));

    await Task.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: 'Tasks reordered' });
  } catch (error) { next(error); }
};

// @desc    Add comment — any project member
// @route   POST /api/tasks/:id/comments
export const addComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const role = await getProjectRole(task.project, req.user._id);
    if (!role) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project' });
    }

    const comment = await Comment.create({
      content: req.body.content,
      author: req.user._id,
      task: task._id,
      mentions: req.body.mentions || [],
    });
    await comment.populate('author', 'name email avatar');

    await Activity.create({
      user: req.user._id,
      action: 'commented',
      entityType: 'comment',
      entityId: comment._id,
      project: task.project,
      details: { taskTitle: task.title },
    });

    try { getIO().to(`project:${task.project}`).emit('comment:added', { taskId: task._id, comment }); } catch(e) {}

    res.status(201).json({ success: true, comment });
  } catch (error) { next(error); }
};

// @desc    Update checklist item — project admin or assigned member
// @route   PUT /api/tasks/:id/checklist/:itemIndex
export const updateChecklistItem = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const role = await getProjectRole(task.project, req.user._id);

    if (!role) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project' });
    }

    // Members may only touch checklist on tasks assigned to them
    if (role === 'member') {
      const isAssignedToMe =
        task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
      if (!isAssignedToMe) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update checklist items on tasks assigned to them',
        });
      }
    }

    const index = parseInt(req.params.itemIndex);
    if (index >= 0 && index < task.checklist.length) {
      task.checklist[index] = { ...task.checklist[index].toObject(), ...req.body };
      await task.save();
    }

    res.status(200).json({ success: true, task });
  } catch (error) { next(error); }
};
