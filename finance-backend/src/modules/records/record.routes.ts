import { Router } from 'express';
import { Role } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.guard';
import { validate } from '../../middleware/validate.middleware';
import * as recordController from './record.controller';
import { createRecordSchema, updateRecordSchema } from './record.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole(Role.ADMIN, Role.ANALYST, Role.VIEWER), recordController.getAll);
router.get('/:slug', requireRole(Role.ADMIN, Role.ANALYST, Role.VIEWER), recordController.getBySlug);
router.post('/', requireRole(Role.ADMIN, Role.ANALYST), validate(createRecordSchema), recordController.create);
router.patch('/:slug', requireRole(Role.ADMIN, Role.ANALYST), validate(updateRecordSchema), recordController.update);
router.delete('/:slug', requireRole(Role.ADMIN), recordController.softDelete);

export default router;
