import { Router } from 'express';
import { clientsController } from '../controllers/clientsController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';
import { validateClient } from '../middleware/validate';

const router = Router();

router.get('/', requireAuth, clientsController.getAll);
router.get('/:id', requireAuth, clientsController.getById);
router.post('/', requireAuth, requireRole(ROLE_GROUPS.OPS), validateClient, clientsController.create);
router.put('/:id', requireAuth, requireRole(ROLE_GROUPS.OPS), clientsController.update);
router.patch('/:id', requireAuth, requireRole(ROLE_GROUPS.OPS), clientsController.update);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), clientsController.delete);

export default router;
