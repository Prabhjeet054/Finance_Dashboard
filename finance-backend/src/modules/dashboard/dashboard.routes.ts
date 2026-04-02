import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', (_req, res) => {
	res.status(200).json({
		success: true,
		message: 'Dashboard route is ready',
	});
});

export default router;
