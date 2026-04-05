import { Router } from 'express';
import { Role } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.guard';
import { validate, validateParams, validateQuery } from '../../middleware/validate.middleware';
import * as userController from './user.controller';
import { createUserSchema, updateUserSchema, userListQuerySchema, userSlugParamSchema } from './user.schema';

const router = Router();

router.use(authMiddleware, requireRole(Role.ADMIN));

router.get('/', validateQuery(userListQuerySchema), userController.getAll);
router.get('/:slug', validateParams(userSlugParamSchema), userController.getBySlug);
router.post('/', validate(createUserSchema), userController.create);
router.patch('/:slug', validateParams(userSlugParamSchema), validate(updateUserSchema), userController.update);
router.delete('/:slug', validateParams(userSlugParamSchema), userController.deactivate);

export default router;
