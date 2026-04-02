import type { Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils/response';
import { login, register } from './auth.service';

export async function registerHandler(req: Request, res: Response): Promise<void> {
	try {
		const user = await register(req.body);
		sendSuccess(res, user, 201);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Registration failed';
		sendError(res, message, 400);
	}
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
	const { email, password } = req.body;

	if (typeof email !== 'string' || typeof password !== 'string') {
		sendError(res, 'Email and password are required', 400);
		return;
	}

	try {
		const result = await login(email, password);
		sendSuccess(res, result, 200);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Login failed';
		const statusCode = message === 'User account is inactive' ? 403 : 401;
		sendError(res, message, statusCode);
	}
}
