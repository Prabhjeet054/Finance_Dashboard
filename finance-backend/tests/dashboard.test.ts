import dashboardRoutes from '../src/modules/dashboard/dashboard.routes';

describe('dashboard routes', () => {
	it('registers at least one route', () => {
		expect(dashboardRoutes.stack.length).toBeGreaterThan(0);
	});
});
