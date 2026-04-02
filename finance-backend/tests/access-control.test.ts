import { Role } from '@prisma/client';
import { requireRole } from '../src/middleware/role.guard';

describe('requireRole', () => {
	it('returns 403 for insufficient permissions', () => {
		const guard = requireRole(Role.ADMIN);
		const req = { user: { id: 'user-1', role: Role.VIEWER } } as never;
		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as never;
		const next = jest.fn();

		guard(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect((res as { status: jest.Mock }).status).toHaveBeenCalledWith(403);
		expect((res as { json: jest.Mock }).json).toHaveBeenCalledWith({
			success: false,
			message: 'Forbidden: insufficient permissions',
		});
	});
});
