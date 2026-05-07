import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import { getIO } from '../config/socket.js';

// ─── Project-level role helpers ────────────────────────────────────────────────

// Get user ID string safely — handles both ObjectId and populated User object
const uid = (u) => (u?._id ? u._id.toString() : u?.toString());

// Get a user's role within a specific project ('admin' | 'member' | null)
const getProjectRole = (project, userId) => {
  const id = uid(userId);
  const member = project.members.find(m => uid(m.user) === id);
  return member ? member.role : null;
};

// Is the user the project admin?
const isProjectAdmin = (project, user) =>
  getProjectRole(project, user._id) === 'admin';

// Is the user any kind of member (admin or member)?
const isProjectMember = (project, userId) => {
  const id = uid(userId);
  return project.members.some(m => uid(m.user) === id);
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// @desc    Create project — any logged-in user becomes project Admin
// @route   POST /api/projects
export const createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],  // creator = project admin
    });
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    await Activity.create({
      user: req.user._id,
      action: 'created_project',
      entityType: 'project',
      entityId: project._id,
      project: project._id,
      details: { projectName: project.name },
    });

    try { getIO().emit('project:created', project); } catch(e) {}

    res.status(201).json({ success: true, project });
  } catch (error) { next(error); }
};

// @desc    Get projects for the current user (only projects they belong to)
// @route   GET /api/projects
export const getProjects = async (req, res, next) => {
  try {
    const { status, priority, search, sort } = req.query;

    // Only show projects where the user is a member
    const filter = { 'members.user': req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$and = [{ 'members.user': req.user._id }];
      delete filter['members.user'];
      filter.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    let sortObj = { updatedAt: -1 };
    if (sort === 'name') sortObj = { name: 1 };
    if (sort === 'dueDate') sortObj = { dueDate: 1 };
    if (sort === 'priority') sortObj = { priority: -1 };

    const projects = await Project.find(filter)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar isOnline')
      .sort(sortObj);

    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const projectObj = project.toObject();
        projectObj.progress = progress;
        projectObj.taskCount = totalTasks;
        projectObj.completedTaskCount = completedTasks;
        // Attach current user's role in this project
        projectObj.myRole = getProjectRole(project, req.user._id);
        return projectObj;
      })
    );

    res.status(200).json({ success: true, projects: projectsWithProgress });
  } catch (error) { next(error); }
};

// @desc    Get single project — only accessible to project members
// @route   GET /api/projects/:id
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar isOnline');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Block non-members
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied: you are not a member of this project' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    const projectObj = project.toObject();
    projectObj.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    projectObj.tasks = tasks;
    projectObj.taskCount = totalTasks;
    projectObj.completedTaskCount = completedTasks;
    projectObj.myRole = getProjectRole(project, req.user._id);  // 'admin' or 'member'

    res.status(200).json({ success: true, project: projectObj });
  } catch (error) { next(error); }
};

// @desc    Update project — project admin only
// @route   PUT /api/projects/:id
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (!isProjectAdmin(project, req.user)) {
      return res.status(403).json({ success: false, message: 'Only the project admin can update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    await Activity.create({
      user: req.user._id,
      action: 'updated_project',
      entityType: 'project',
      entityId: project._id,
      project: project._id,
      details: { projectName: project.name, changes: Object.keys(req.body) },
    });

    try { getIO().to(`project:${project._id}`).emit('project:updated', project); } catch(e) {}

    res.status(200).json({ success: true, project });
  } catch (error) { next(error); }
};

// @desc    Delete project — project admin only
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (!isProjectAdmin(project, req.user)) {
      return res.status(403).json({ success: false, message: 'Only the project admin can delete this project' });
    }

    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    try { getIO().emit('project:deleted', req.params.id); } catch(e) {}

    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) { next(error); }
};

// @desc    Add member to project — project admin only
// @route   POST /api/projects/:id/members
export const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (!isProjectAdmin(project, req.user)) {
      return res.status(403).json({ success: false, message: 'Only the project admin can add members' });
    }

    const isMember = project.members.some(m => m.user.toString() === userId);
    if (isMember) return res.status(400).json({ success: false, message: 'User is already a member' });

    project.members.push({ user: userId, role: 'member' });  // invited users = member
    await project.save();
    await project.populate('members.user', 'name email avatar');

    await Activity.create({
      user: req.user._id,
      action: 'invited_member',
      entityType: 'project',
      entityId: project._id,
      project: project._id,
      details: { memberId: userId },
    });

    res.status(200).json({ success: true, project });
  } catch (error) { next(error); }
};

// @desc    Remove member from project — project admin only
// @route   DELETE /api/projects/:id/members/:userId
export const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (!isProjectAdmin(project, req.user)) {
      return res.status(403).json({ success: false, message: 'Only the project admin can remove members' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.status(200).json({ success: true, project });
  } catch (error) { next(error); }
};

// @desc    Toggle favorite
// @route   PUT /api/projects/:id/favorite
export const toggleFavorite = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const index = project.favoritedBy.indexOf(req.user._id);
    if (index > -1) project.favoritedBy.splice(index, 1);
    else project.favoritedBy.push(req.user._id);
    await project.save();

    res.status(200).json({ success: true, isFavorite: project.favoritedBy.includes(req.user._id) });
  } catch (error) { next(error); }
};
