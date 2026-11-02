import { Router } from 'express';
import { reportsController } from '../controllers/reportsController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';
import { validateReport } from '../middleware/validate';

const router = Router();

router.get('/', requireAuth, reportsController.getAll);
router.get('/:id', requireAuth, reportsController.getById);
router.post('/', requireAuth, validateReport, reportsController.create);
router.put('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), reportsController.update);
router.patch('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), reportsController.update);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), reportsController.delete);

export default router;
