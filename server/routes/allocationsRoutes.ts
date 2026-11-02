import { Router } from 'express';
import { allocationsController } from '../controllers/allocationsController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';
import { validateAllocation } from '../middleware/validate';

const router = Router();

router.get('/', requireAuth, allocationsController.getAll);
router.get('/:id', requireAuth, allocationsController.getById);
router.post('/', requireAuth, requireRole(ROLE_GROUPS.OPS), validateAllocation, allocationsController.create);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.OPS), allocationsController.delete);

export default router;
