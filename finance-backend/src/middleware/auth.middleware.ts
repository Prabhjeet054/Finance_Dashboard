import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

type AuthenticatedRequest = Request & {
	user?: {
		id: string;
		role: string;
	};
};

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ success: false, message: 'Unauthorized' });
		return;
	}

	const token = authHeader.slice(7).trim();

	try {
		const payload = verifyToken(token);
		const userId = payload.userId;
		const role = payload.role;

		if (typeof userId !== 'string' || typeof role !== 'string') {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		req.user = {
			id: userId,
			role,
		};

		next();
	} catch {
		res.status(401).json({ success: false, message: 'Unauthorized' });
	}
}
