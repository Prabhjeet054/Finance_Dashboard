import type { Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response';
import * as userService from './user.service';

export async function getAll(req: Request, res: Response): Promise<void> {
	try {
		const page = req.query.page ? Number(req.query.page) : undefined;
		const limit = req.query.limit ? Number(req.query.limit) : undefined;
		const result = await userService.getAll({ page, limit });
		sendSuccess(res, result);
	} catch {
		sendError(res, 'Failed to fetch users', 500);
	}
}

export async function getBySlug(req: Request, res: Response): Promise<void> {
	try {
		const user = await userService.getBySlug(req.params.slug);

		if (!user) {
			sendError(res, 'User not found', 404);
			return;
		}

		sendSuccess(res, user);
	} catch {
		sendError(res, 'Failed to fetch user', 500);
	}
}

export async function create(req: Request, res: Response): Promise<void> {
	try {
		const user = await userService.create(req.body);
		sendSuccess(res, user, 201);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to create user';
		const statusCode = message.includes('already exists') ? 409 : 500;
		sendError(res, message, statusCode);
	}
}

export async function update(req: Request, res: Response): Promise<void> {
	try {
		const user = await userService.update(req.params.slug, req.body);

		if (!user) {
			sendError(res, 'User not found', 404);
			return;
		}

		sendSuccess(res, user);
	} catch {
		sendError(res, 'Failed to update user', 500);
	}
}

export async function deactivate(req: Request, res: Response): Promise<void> {
	try {
		const user = await userService.deactivate(req.params.slug);

		if (!user) {
			sendError(res, 'User not found', 404);
			return;
		}

		sendSuccess(res, user);
	} catch {
		sendError(res, 'Failed to deactivate user', 500);
	}
}
