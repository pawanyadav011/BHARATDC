import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/rbacMiddleware';

const router = Router();

router.get('/', requireAuth, dashboardController.getStats);
router.get('/stats', requireAuth, dashboardController.getStats);
router.get('/summary', requireAuth, dashboardController.getStats);

export default router;
