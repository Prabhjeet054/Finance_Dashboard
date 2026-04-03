import { Router } from 'express';
import { Role } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.guard';
import {
	getSummaryHandler,
	getCategoryBreakdownHandler,
	getMonthlyTrendsHandler,
	getRecentActivityHandler,
} from './dashboard.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/v1/dashboard/summary - ADMIN, ANALYST only
router.get('/summary', requireRole(Role.ADMIN, Role.ANALYST), getSummaryHandler);

// GET /api/v1/dashboard/categories - ADMIN, ANALYST only
router.get('/categories', requireRole(Role.ADMIN, Role.ANALYST), getCategoryBreakdownHandler);

// GET /api/v1/dashboard/trends?year=YYYY - ADMIN, ANALYST only
router.get('/trends', requireRole(Role.ADMIN, Role.ANALYST), getMonthlyTrendsHandler);

// GET /api/v1/dashboard/recent - ADMIN, ANALYST, VIEWER
router.get('/recent', requireRole(Role.ADMIN, Role.ANALYST, Role.VIEWER), getRecentActivityHandler);

export default router;
