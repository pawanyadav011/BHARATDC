import { Router } from 'express';
import { organizationsController } from '../controllers/organizationsController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';
import { validateOrganization } from '../middleware/validate';

const router = Router();

router.get('/', requireAuth, organizationsController.getAll);
router.get('/:id', requireAuth, organizationsController.getById);
router.post('/', requireAuth, requireRole(ROLE_GROUPS.ADMINS), validateOrganization, organizationsController.create);
router.put('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), organizationsController.update);
router.patch('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), organizationsController.update);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), organizationsController.delete);

export default router;
