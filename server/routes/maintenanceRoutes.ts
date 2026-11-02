import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenanceController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';
import { validateMaintenance } from '../middleware/validate';

const router = Router();

router.get('/', requireAuth, maintenanceController.getAll);
router.get('/:id', requireAuth, maintenanceController.getById);
router.post('/', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), validateMaintenance, maintenanceController.create);
router.put('/:id', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), maintenanceController.update);
router.patch('/:id', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), maintenanceController.update);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), maintenanceController.delete);

// Custom workflow endpoints
router.post('/:id/start', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), maintenanceController.start);
router.post('/:id/complete', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), maintenanceController.complete);
router.post('/:id/cancel', requireAuth, requireRole(ROLE_GROUPS.INFRASTRUCTURE), maintenanceController.cancel);

export default router;
