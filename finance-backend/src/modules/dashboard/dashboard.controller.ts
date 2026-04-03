import type { RequestHandler } from 'express';
import { Role } from '@prisma/client';
import { sendSuccess, sendError } from '../../utils/response';
import * as dashboardService from './dashboard.service';

type AuthenticatedRequest = {
	user?: {
		id: string;
		role: Role;
	};
};

export const getSummaryHandler: RequestHandler = async (req, res) => {
	try {
		const summary = await dashboardService.getSummary();
		sendSuccess(res, summary, 200);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch summary';
		sendError(res, message, 500);
	}
};

export const getCategoryBreakdownHandler: RequestHandler = async (req, res) => {
	try {
		const breakdown = await dashboardService.getCategoryBreakdown();
		sendSuccess(res, breakdown, 200);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch category breakdown';
		sendError(res, message, 500);
	}
};

export const getMonthlyTrendsHandler: RequestHandler = async (req, res) => {
	try {
		const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();

		if (isNaN(year) || year < 1900 || year > 2100) {
			return sendError(res, 'Invalid year parameter', 400);
		}

		const trends = await dashboardService.getMonthlyTrends(year);
		sendSuccess(res, trends, 200);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch monthly trends';
		sendError(res, message, 500);
	}
};

export const getRecentActivityHandler: RequestHandler = async (req, res) => {
	try {
		const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10))) : 10;

		if (isNaN(limit)) {
			return sendError(res, 'Invalid limit parameter', 400);
		}

		const activity = await dashboardService.getRecentActivity(limit);
		sendSuccess(res, activity, 200);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch recent activity';
		sendError(res, message, 500);
	}
};
