import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

export function validate(schema: ZodSchema): RequestHandler {
	return createValidator(schema, 'body');
}

export function validateQuery(schema: ZodSchema): RequestHandler {
	return createValidator(schema, 'query');
}

export function validateParams(schema: ZodSchema): RequestHandler {
	return createValidator(schema, 'params');
}

function createValidator(schema: ZodSchema, source: 'body' | 'query' | 'params'): RequestHandler {
	return (req, res, next): void => {
		const result = schema.safeParse(req[source]);

		if (!result.success) {
			res.status(422).json({
				success: false,
				message: 'Validation failed',
				errors: result.error.flatten().fieldErrors,
				timestamp: new Date().toISOString(),
			});
			return;
		}

		if (source === 'body') {
			req.body = result.data;
		} else if (source === 'query') {
			req.query = result.data as typeof req.query;
		} else {
			req.params = result.data as typeof req.params;
		}
		next();
	};
}
