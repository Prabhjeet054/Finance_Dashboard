import type { NextFunction, Request, Response } from 'express';

type AuthenticatedRequest = Request & {
	user?: {
		id: string;
		role: string;
	};
};

export function requireRole(...allowedRoles: string[]) {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
		const userRole = req.user?.role;

		if (!userRole || !allowedRoles.includes(userRole)) {
			res.status(403).json({
				success: false,
				message: 'Forbidden',
			});
			return;
		}

		next();
	};
}
