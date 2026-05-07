import { Router } from 'express';
import {
  createProject, getProjects, getProject,
  updateProject, deleteProject,
  addMember, removeMember, toggleFavorite,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { isProjectOwner, isProjectMember } from '../middleware/rbac.js';
import { validateProject } from '../middleware/validate.js';

const router = Router();

// All project routes require authentication
router.use(protect);

// List own projects / create new project (anyone authenticated)
router.route('/')
  .get(getProjects)
  .post(validateProject, createProject);

// Single project — member can view; owner can update/delete
router.get('/:id', isProjectMember, getProject);
router.put('/:id', isProjectOwner, updateProject);
router.delete('/:id', isProjectOwner, deleteProject);

// Member management — owner only
router.post('/:id/members', isProjectOwner, addMember);
router.delete('/:id/members/:userId', isProjectOwner, removeMember);

// Favorite — any member
router.put('/:id/favorite', isProjectMember, toggleFavorite);

export default router;
