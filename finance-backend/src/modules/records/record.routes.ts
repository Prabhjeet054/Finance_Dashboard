import { Router } from 'express';
import { Role } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.guard';

const router = Router();

router.use(authMiddleware, requireRole(Role.ADMIN, Role.ANALYST, Role.VIEWER));

router.get('/', (_req, res) => {
	res.status(200).json({
		success: true,
		message: 'Records route is ready',
	});
});

export default router;
