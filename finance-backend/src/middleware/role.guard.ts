import type { RequestHandler } from 'express';
import { Role } from '@prisma/client';

type AuthenticatedRequest = {
	user?: {
		id: string;
		role: Role;
	};
};

export function requireRole(...roles: Role[]): RequestHandler {
	return (req, res, next): void => {
		const authenticatedRequest = req as typeof req & AuthenticatedRequest;
		const userRole = authenticatedRequest.user?.role;

		if (!userRole || !roles.includes(userRole)) {
			res.status(403).json({
				success: false,
				message: 'Forbidden: insufficient permissions',
			});
			return;
		}

		next();
	};
}
