import { Router } from 'express';
import { usersController } from '../controllers/usersController';
import { requireAuth, requireRole, ROLE_GROUPS } from '../middleware/rbacMiddleware';
import { validateUser } from '../middleware/validate';

const router = Router();

router.get('/', requireAuth, usersController.getAll);
router.get('/:id', requireAuth, usersController.getById);
router.post('/', requireAuth, requireRole(ROLE_GROUPS.ADMINS), validateUser, usersController.create);
router.put('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), usersController.update);
router.patch('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), usersController.update);
router.delete('/:id', requireAuth, requireRole(ROLE_GROUPS.ADMINS), usersController.delete);

export default router;
