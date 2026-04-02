import type { Response } from 'express';

type ApiSuccessResponse<T> = {
	success: true;
	data: T;
	timestamp: string;
};

type ApiErrorResponse = {
	success: false;
	message: string;
	timestamp: string;
};

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response<ApiSuccessResponse<T>> {
	return res.status(statusCode).json({
		success: true,
		data,
		timestamp: new Date().toISOString(),
	});
}

export function sendError(res: Response, message: string, statusCode = 400): Response<ApiErrorResponse> {
	return res.status(statusCode).json({
		success: false,
		message,
		timestamp: new Date().toISOString(),
	});
}
