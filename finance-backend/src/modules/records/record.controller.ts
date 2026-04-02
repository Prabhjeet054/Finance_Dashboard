import { Role } from '@prisma/client';
import type { Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response';
import { filterRecordSchema } from './record.schema';
import * as recordService from './record.service';

type AuthenticatedRequest = Request & {
	user?: {
		id: string;
		role: Role;
	};
};

export async function getAll(req: Request, res: Response): Promise<void> {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.user) {
		sendError(res, 'Unauthorized', 401);
		return;
	}

	const parsed = filterRecordSchema.safeParse(req.query);

	if (!parsed.success) {
		res.status(422).json({
			success: false,
			errors: parsed.error.flatten().fieldErrors,
		});
		return;
	}

	try {
		const result = await recordService.getAll(authReq.user.id, authReq.user.role, parsed.data);
		sendSuccess(res, result);
	} catch {
		sendError(res, 'Failed to fetch records', 500);
	}
}

export async function getBySlug(req: Request, res: Response): Promise<void> {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.user) {
		sendError(res, 'Unauthorized', 401);
		return;
	}

	try {
		const record = await recordService.getBySlug(req.params.slug, authReq.user.id, authReq.user.role);

		if (!record) {
			sendError(res, 'Record not found', 404);
			return;
		}

		sendSuccess(res, record);
	} catch {
		sendError(res, 'Failed to fetch record', 500);
	}
}

export async function create(req: Request, res: Response): Promise<void> {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.user) {
		sendError(res, 'Unauthorized', 401);
		return;
	}

	try {
		const record = await recordService.create(req.body, authReq.user.id);
		sendSuccess(res, record, 201);
	} catch {
		sendError(res, 'Failed to create record', 500);
	}
}

export async function update(req: Request, res: Response): Promise<void> {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.user) {
		sendError(res, 'Unauthorized', 401);
		return;
	}

	try {
		const record = await recordService.update(req.params.slug, req.body, authReq.user.id, authReq.user.role);

		if (!record) {
			sendError(res, 'Record not found', 404);
			return;
		}

		sendSuccess(res, record);
	} catch {
		sendError(res, 'Failed to update record', 500);
	}
}

export async function softDelete(req: Request, res: Response): Promise<void> {
	const authReq = req as AuthenticatedRequest;

	if (!authReq.user) {
		sendError(res, 'Unauthorized', 401);
		return;
	}

	try {
		const record = await recordService.softDelete(req.params.slug, authReq.user.id, authReq.user.role);

		if (!record) {
			sendError(res, 'Record not found', 404);
			return;
		}

		sendSuccess(res, record);
	} catch {
		sendError(res, 'Failed to delete record', 500);
	}
}
