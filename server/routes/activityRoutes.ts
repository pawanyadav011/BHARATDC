import { Router } from 'express';
import { activityController } from '../controllers/activityController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';

const router = Router();

router.get('/', requireAuth, activityController.getAll);
router.get('/:id', requireAuth, activityController.getById);
router.post('/', requireAuth, activityController.create);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), activityController.delete);

export default router;
