import { Router } from 'express';
import { dataCentersController } from '../controllers/dataCentersController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';
import { validateDataCenter } from '../middleware/validate';

const router = Router();

router.get('/', requireAuth, dataCentersController.getAll);
router.get('/:id', requireAuth, dataCentersController.getById);
router.post('/', requireAuth, requireRole(ROLE_GROUPS.OPS), validateDataCenter, dataCentersController.create);
router.put('/:id', requireAuth, requireRole(ROLE_GROUPS.OPS), dataCentersController.update);
router.patch('/:id', requireAuth, requireRole(ROLE_GROUPS.OPS), dataCentersController.update);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), dataCentersController.delete);

export default router;
