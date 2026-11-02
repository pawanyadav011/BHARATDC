import { Router } from 'express';
import { notificationsController } from '../controllers/notificationsController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';
import { validateNotification } from '../middleware/validate';

const router = Router();

router.get('/', requireAuth, notificationsController.getAll);
router.get('/:id', requireAuth, notificationsController.getById);
router.post('/', requireAuth, validateNotification, notificationsController.create);
router.put('/:id', requireAuth, notificationsController.update);
router.patch('/:id', requireAuth, notificationsController.update);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), notificationsController.delete);

// Mark as read endpoints
router.post('/mark-all-read', requireAuth, notificationsController.markAllAsRead);
router.post('/:id/read', requireAuth, notificationsController.markAsRead);

export default router;
