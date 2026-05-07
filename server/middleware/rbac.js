import Project from '../models/Project.js';

// Helper: resolve user ID to a plain string regardless of ObjectId vs populated object
const uid = (u) => (u?._id ? u._id.toString() : u?.toString() ?? '');

/**
 * isProjectOwner
 * Route-level guard: the authenticated user must be a project member with role === 'admin'.
 * Expects req.params.id  to be the project's MongoDB _id.
 * Must be used AFTER the `protect` middleware so req.user is available.
 */
export const isProjectOwner = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).select('members');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const member = project.members.find(
      (m) => uid(m.user) === uid(req.user._id)
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: only the project owner can perform this action',
      });
    }

    // Attach role to request for downstream use if needed
    req.projectRole = 'admin';
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during permission check' });
  }
};

/**
 * isProjectMember
 * Route-level guard: the authenticated user must be any member (admin or member) of the project.
 * Expects req.params.id to be the project's MongoDB _id.
 * Must be used AFTER the `protect` middleware.
 */
export const isProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).select('members');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const member = project.members.find(
      (m) => uid(m.user) === uid(req.user._id)
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: you are not a member of this project',
      });
    }

    // Attach role so controllers can read req.projectRole without a second DB hit
    req.projectRole = member.role;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during permission check' });
  }
};
