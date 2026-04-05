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
		const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

		const trends = await dashboardService.getMonthlyTrends(year);
		sendSuccess(res, trends, 200);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch monthly trends';
		sendError(res, message, 500);
	}
};

export const getRecentActivityHandler: RequestHandler = async (req, res) => {
	try {
		const limit = req.query.limit ? Number(req.query.limit) : 10;

		const activity = await dashboardService.getRecentActivity(limit);
		sendSuccess(res, activity, 200);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch recent activity';
		sendError(res, message, 500);
	}
};
