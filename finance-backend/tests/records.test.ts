/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import { resetDatabase, seedUser, seedRecord, generateAuthToken, disconnectDatabase } from './helpers';
import { Role } from '@prisma/client';

describe('Records Endpoints', () => {
	let adminId: string;
	let adminToken: string;
	let recordSlug: string;
	let testRecords: Array<{ slug: string; amount: number; category: string; type: string }> = [];

	beforeAll(async () => {
		await resetDatabase();

		// Seed admin user
		const adminUser = await seedUser('Admin User', 'admin@example.com', 'AdminPass123', Role.ADMIN);
		adminId = adminUser.id;
		adminToken = await generateAuthToken(adminId, Role.ADMIN);

		// Seed 10 test records with various categories and types for filtering tests
		const testData = [
			{ amount: 5000, type: 'INCOME' as const, category: 'Salary', date: new Date('2024-01-15') },
			{ amount: 2000, type: 'EXPENSE' as const, category: 'Rent', date: new Date('2024-01-20') },
			{ amount: 1500, type: 'EXPENSE' as const, category: 'Utilities', date: new Date('2024-02-10') },
			{ amount: 3000, type: 'INCOME' as const, category: 'Bonus', date: new Date('2024-02-25') },
			{ amount: 500, type: 'EXPENSE' as const, category: 'Groceries', date: new Date('2024-03-05') },
			{ amount: 1200, type: 'EXPENSE' as const, category: 'Rent', date: new Date('2024-03-20') },
			{ amount: 4000, type: 'INCOME' as const, category: 'Freelance', date: new Date('2024-04-10') },
			{ amount: 800, type: 'EXPENSE' as const, category: 'Utilities', date: new Date('2024-05-15') },
			{ amount: 2500, type: 'EXPENSE' as const, category: 'Groceries', date: new Date('2024-06-01') },
			{ amount: 6000, type: 'INCOME' as const, category: 'Salary', date: new Date('2024-07-01') },
		];

		for (const data of testData) {
			const record = await seedRecord(adminId, data.amount, data.type, data.category, data.date);
			testRecords.push({ slug: record.slug, amount: record.amount.toNumber(), category: record.category, type: data.type });
		}

		recordSlug = testRecords[0].slug;
	});

	afterAll(async () => {
		await disconnectDatabase();
	});

	describe('GET /api/v1/records', () => {
		it('returns paginated results with data, meta, and pagination info', async () => {
			const response = await request(app)
				.get('/api/v1/records')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('items');
			expect(response.body.data).toHaveProperty('meta');
			expect(response.body.data.meta).toHaveProperty('page');
			expect(response.body.data.meta).toHaveProperty('limit');
			expect(response.body.data.meta).toHaveProperty('total');
			expect(response.body.data.meta).toHaveProperty('totalPages');
			expect(response.body.data.meta.page).toBe(1);
			expect(response.body.data.meta.limit).toBe(10);
			expect(response.body.data.meta.total).toBe(10);
			expect(response.body.data.items).toHaveLength(10);
		});

		it('filters by type=INCOME correctly', async () => {
			const response = await request(app)
				.get('/api/v1/records?type=INCOME')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.items).toHaveLength(4); // 4 INCOME records
			expect(response.body.data.items.every((r: any) => r.type === 'INCOME')).toBe(true);
		});

		it('filters by type=EXPENSE correctly', async () => {
			const response = await request(app)
				.get('/api/v1/records?type=EXPENSE')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.items).toHaveLength(6); // 6 EXPENSE records
			expect(response.body.data.items.every((r: any) => r.type === 'EXPENSE')).toBe(true);
		});

		it('filters by category=Rent correctly', async () => {
			const response = await request(app)
				.get('/api/v1/records?category=Rent')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.items.every((r: any) => r.category === 'Rent')).toBe(true);
			expect(response.body.data.items.length).toBeGreaterThan(0);
		});

		it('filters by category=Utilities correctly', async () => {
			const response = await request(app)
				.get('/api/v1/records?category=Utilities')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.items.every((r: any) => r.category === 'Utilities')).toBe(true);
		});

		it('filters by startDate and endDate correctly', async () => {
			const response = await request(app)
				.get('/api/v1/records?startDate=2024-01-01&endDate=2024-03-31')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			const items = response.body.data.items;
			expect(items.length).toBeGreaterThan(0);
			items.forEach((record: any) => {
				const recordDate = new Date(record.date);
				expect(recordDate.getTime()).toBeGreaterThanOrEqual(new Date('2024-01-01').getTime());
				expect(recordDate.getTime()).toBeLessThanOrEqual(new Date('2024-03-31T23:59:59').getTime());
			});
		});

		it('paginates correctly with page=2 and limit=5', async () => {
			const response = await request(app)
				.get('/api/v1/records?page=2&limit=5')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.meta.page).toBe(2);
			expect(response.body.data.meta.limit).toBe(5);
			expect(response.body.data.items).toHaveLength(5);
		});

		it('returns default page and limit when not specified', async () => {
			const response = await request(app)
				.get('/api/v1/records')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.body.data.meta.page).toBe(1);
			expect(response.body.data.meta.limit).toBe(10);
		});

		it('excludes soft-deleted records from results', async () => {
			// First, get initial count
			const initialResponse = await request(app)
				.get('/api/v1/records')
				.set('Authorization', `Bearer ${adminToken}`);

			const initialCount = initialResponse.body.data.meta.total;

			// Delete a record
			await request(app)
				.delete(`/api/v1/records/${recordSlug}`)
				.set('Authorization', `Bearer ${adminToken}`);

			// Get records again
			const afterDeleteResponse = await request(app)
				.get('/api/v1/records')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(afterDeleteResponse.body.data.meta.total).toBe(initialCount - 1);
		});
	});

	describe('GET /api/v1/records/:slug', () => {
		it('returns a specific record by slug', async () => {
			const response = await request(app)
				.get(`/api/v1/records/${recordSlug}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.slug).toBe(recordSlug);
			expect(response.body.data).toHaveProperty('id');
			expect(response.body.data).toHaveProperty('amount');
			expect(response.body.data).toHaveProperty('type');
			expect(response.body.data).toHaveProperty('category');
		});

		it('returns 404 for non-existent slug', async () => {
			const response = await request(app)
				.get('/api/v1/records/nonexistent-slug-xyz123')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
		});
	});

	describe('PATCH /api/v1/records/:slug', () => {
		let updateTestSlug: string;

		beforeAll(async () => {
			// Create a record specifically for update testing
			const record = await seedRecord(adminId, 1000, 'EXPENSE', 'TestUpdate', new Date('2024-08-01'));
			updateTestSlug = record.slug;
		});

		it('updates record fields correctly', async () => {
			const response = await request(app)
				.patch(`/api/v1/records/${updateTestSlug}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					amount: 2000,
					category: 'Updated Category',
					notes: 'Updated notes',
				});

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.amount).toBe('2000');
			expect(response.body.data.category).toBe('Updated Category');
			expect(response.body.data.notes).toBe('Updated notes');
		});

		it('updates only provided fields', async () => {
			const getResponseBefore = await request(app)
				.get(`/api/v1/records/${updateTestSlug}`)
				.set('Authorization', `Bearer ${adminToken}`);

			const typeBefore = getResponseBefore.body.data.type;

			const response = await request(app)
				.patch(`/api/v1/records/${updateTestSlug}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({
					category: 'Partially Updated',
				});

			expect(response.status).toBe(200);
			expect(response.body.data.category).toBe('Partially Updated');
			expect(response.body.data.type).toBe(typeBefore);
		});

		it('returns 404 for non-existent record', async () => {
			const response = await request(app)
				.patch('/api/v1/records/nonexistent-slug-xyz')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({ category: 'New Category' });

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
		});
	});

	describe('DELETE /api/v1/records/:slug', () => {
		let deleteTestSlug: string;

		beforeAll(async () => {
			const record = await seedRecord(adminId, 1500, 'INCOME', 'TestDelete', new Date('2024-09-01'));
			deleteTestSlug = record.slug;
		});

		it('soft-deletes record (sets isDeleted=true)', async () => {
			const response = await request(app)
				.delete(`/api/v1/records/${deleteTestSlug}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('deleted record does not appear in GET /api/v1/records', async () => {
			// Try to fetch the deleted record
			const response = await request(app)
				.get(`/api/v1/records/${deleteTestSlug}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(404);
		});

		it('returns 404 when deleting non-existent record', async () => {
			const response = await request(app)
				.delete('/api/v1/records/nonexistent-slug-xyz')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
		});
	});
});
