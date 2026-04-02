import { Role } from '@prisma/client';
import { authMiddleware } from '../src/middleware/auth.middleware';
import { signToken } from '../src/utils/jwt';

describe('authMiddleware', () => {
	beforeAll(() => {
		process.env.JWT_SECRET = 'test-secret';
	});

	it('returns 401 when bearer token is missing', () => {
		const req = { headers: {} } as never;
		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as never;
		const next = jest.fn();

		authMiddleware(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect((res as { status: jest.Mock }).status).toHaveBeenCalledWith(401);
	});

	it('attaches req.user for a valid token', () => {
		const token = signToken({ userId: 'user-1', role: Role.ADMIN });
		const req = { headers: { authorization: `Bearer ${token}` } } as never;
		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as never;
		const next = jest.fn();

		authMiddleware(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect((req as { user?: { id: string; role: Role } }).user).toEqual({
			id: 'user-1',
			role: Role.ADMIN,
		});
	});
});
