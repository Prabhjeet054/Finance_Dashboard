/// <reference types="jest" />
import recordRoutes from '../src/modules/records/record.routes';

describe('record routes', () => {
	it('registers at least one route', () => {
		expect(recordRoutes.stack.length).toBeGreaterThan(0);
	});
});
