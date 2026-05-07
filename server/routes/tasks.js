import { Router } from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask, reorderTasks, addComment, updateChecklistItem } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validateTask } from '../middleware/validate.js';

const router = Router();

router.use(protect);
router.route('/').get(getTasks).post(validateTask, createTask);
router.put('/reorder', reorderTasks);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.post('/:id/comments', addComment);
router.put('/:id/checklist/:itemIndex', updateChecklistItem);

export default router;
