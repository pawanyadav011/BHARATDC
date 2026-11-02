import { Router } from 'express';
import { racksController } from '../controllers/racksController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';
import { validateRack } from '../middleware/validate';

const router = Router();

router.get('/', requireAuth, racksController.getAll);
router.get('/:id', requireAuth, racksController.getById);
router.post('/', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), validateRack, racksController.create);
router.put('/:id', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), racksController.update);
router.patch('/:id', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), racksController.update);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), racksController.delete);

export default router;
