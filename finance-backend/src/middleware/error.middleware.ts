import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

type ErrorWithStatusCode = Error & { statusCode?: number };

export const notFoundHandler: RequestHandler = (_req, res) => {
	sendError(res, 'Route not found', 404);
};

export const globalErrorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
	const isDev = process.env.NODE_ENV === 'development';

	// Handle Prisma PrismaClientKnownRequestError
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === 'P2002') {
			// Unique constraint violation
			const response = {
				success: false,
				message: 'Already exists',
				timestamp: new Date().toISOString(),
			};
			return res.status(409).json(isDev ? { ...response, stack: err.stack } : response);
		}

		if (err.code === 'P2025') {
			// Record not found
			const response = {
				success: false,
				message: 'Record not found',
				timestamp: new Date().toISOString(),
			};
			return res.status(404).json(isDev ? { ...response, stack: err.stack } : response);
		}
	}

	// Handle Zod validation errors
	if (err instanceof ZodError) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of err.issues) {
			const path = issue.path.join('.');
			fieldErrors[path] = issue.message;
		}

		const response = {
			success: false,
			message: 'Validation failed',
			errors: fieldErrors,
			timestamp: new Date().toISOString(),
		};
		return res.status(422).json(isDev ? { ...response, stack: err.stack } : response);
	}

	// Handle errors with custom statusCode
	const errorWithStatus = err as ErrorWithStatusCode;
	if (errorWithStatus instanceof Error && errorWithStatus.statusCode) {
		const response = {
			success: false,
			message: errorWithStatus.message,
			timestamp: new Date().toISOString(),
		};
		const statusCode = Math.min(599, Math.max(400, errorWithStatus.statusCode));
		return res.status(statusCode).json(isDev ? { ...response, stack: errorWithStatus.stack } : response);
	}

	// Handle generic Error instances
	if (err instanceof Error) {
		const response = {
			success: false,
			message: err.message,
			timestamp: new Date().toISOString(),
		};
		return res.status(500).json(isDev ? { ...response, stack: err.stack } : response);
	}

	// Handle all other errors
	const response = {
		success: false,
		message: 'Internal server error',
		timestamp: new Date().toISOString(),
	};
	return res.status(500).json(isDev ? { ...response, error: String(err) } : response);
};
