import { Router } from 'express';
import { getUsers, getUserById, updateProfile, changePassword, updateUserRole, deleteUser, getUserStats } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getUsers);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/:id', getUserById);
router.get('/:id/stats', getUserStats);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
