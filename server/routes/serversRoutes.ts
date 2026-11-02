import { Router } from 'express';
import { serversController } from '../controllers/serversController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';
import { validateServer } from '../middleware/validate';

const router = Router();

router.get('/', requireAuth, serversController.getAll);
router.get('/:id', requireAuth, serversController.getById);
router.post('/', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), validateServer, serversController.create);
router.put('/:id', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), serversController.update);
router.patch('/:id', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), serversController.update);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), serversController.delete);

export default router;
