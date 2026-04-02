import { Router } from 'express';
import { Role } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.guard';
import { validate } from '../../middleware/validate.middleware';
import * as userController from './user.controller';
import { createUserSchema, updateUserSchema } from './user.schema';

const router = Router();

router.use(authMiddleware, requireRole(Role.ADMIN));

router.get('/', userController.getAll);
router.get('/:slug', userController.getBySlug);
router.post('/', validate(createUserSchema), userController.create);
router.patch('/:slug', validate(updateUserSchema), userController.update);
router.delete('/:slug', userController.deactivate);

export default router;
