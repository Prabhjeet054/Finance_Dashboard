/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import { resetDatabase, seedUser, seedRecord, generateAuthToken, disconnectDatabase } from './helpers';
import { Role } from '@prisma/client';

describe('Access Control - Role-Based Permissions', () => {
	let viewerId: string;
	let viewerToken: string;
	let analystId: string;
	let analystToken: string;
	let adminId: string;
	let adminToken: string;
	let analystRecordSlug: string;

	beforeAll(async () => {
		await resetDatabase();

		// Seed users for each role
		const viewerUser = await seedUser('Viewer User', 'viewer@example.com', 'ViewerPass123', Role.VIEWER);
		viewerId = viewerUser.id;
		viewerToken = await generateAuthToken(viewerId, Role.VIEWER);

		const analystUser = await seedUser('Analyst User', 'analyst@example.com', 'AnalystPass123', Role.ANALYST);
		analystId = analystUser.id;
		analystToken = await generateAuthToken(analystId, Role.ANALYST);

		const adminUser = await seedUser('Admin User', 'admin@example.com', 'AdminPass123', Role.ADMIN);
		adminId = adminUser.id;
		adminToken = await generateAuthToken(adminId, Role.ADMIN);

		// Seed a record for testing
		const record = await seedRecord(analystId, 5000, 'INCOME', 'Salary');
		analystRecordSlug = record.slug;
	});

	afterAll(async () => {
		await disconnectDatabase();
	});

	describe('Records Endpoint Access Control', () => {
		it('returns 401 without authentication', async () => {
			const response = await request(app).get('/api/v1/records');

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
		});

		describe('GET /api/v1/records', () => {
			it('VIEWER can view records', async () => {
				const response = await request(app)
					.get('/api/v1/records')
					.set('Authorization', `Bearer ${viewerToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.data).toHaveProperty('items');
				expect(response.body.data).toHaveProperty('meta');
			});

			it('ANALYST can view records', async () => {
				const response = await request(app)
					.get('/api/v1/records')
					.set('Authorization', `Bearer ${analystToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
			});

			it('ADMIN can view records', async () => {
				const response = await request(app)
					.get('/api/v1/records')
					.set('Authorization', `Bearer ${adminToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
			});
		});

		describe('POST /api/v1/records', () => {
			it('VIEWER cannot create records (403)', async () => {
				const response = await request(app)
					.post('/api/v1/records')
					.set('Authorization', `Bearer ${viewerToken}`)
					.send({
						amount: 1000,
						type: 'EXPENSE',
						category: 'Groceries',
						date: new Date(),
					});

				expect(response.status).toBe(403);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toContain('insufficient permissions');
			});

			it('ANALYST can create records (201)', async () => {
				const response = await request(app)
					.post('/api/v1/records')
					.set('Authorization', `Bearer ${analystToken}`)
					.send({
						amount: 2000,
						type: 'EXPENSE',
						category: 'Utilities',
						date: new Date(),
					});

				expect(response.status).toBe(201);
				expect(response.body.success).toBe(true);
				expect(response.body.data).toHaveProperty('id');
				expect(response.body.data).toHaveProperty('slug');
			});

			it('ADMIN can create records (201)', async () => {
				const response = await request(app)
					.post('/api/v1/records')
					.set('Authorization', `Bearer ${adminToken}`)
					.send({
						amount: 3000,
						type: 'INCOME',
						category: 'Bonus',
						date: new Date(),
					});

				expect(response.status).toBe(201);
				expect(response.body.success).toBe(true);
			});
		});

		describe('DELETE /api/v1/records/:slug', () => {
			it('VIEWER cannot delete records (403)', async () => {
				const response = await request(app)
					.delete(`/api/v1/records/${analystRecordSlug}`)
					.set('Authorization', `Bearer ${viewerToken}`);

				expect(response.status).toBe(403);
				expect(response.body.success).toBe(false);
			});

			it('ANALYST cannot delete records (403)', async () => {
				const response = await request(app)
					.delete(`/api/v1/records/${analystRecordSlug}`)
					.set('Authorization', `Bearer ${analystToken}`);

				expect(response.status).toBe(403);
				expect(response.body.success).toBe(false);
			});

			it('ADMIN can delete records (200)', async () => {
				// Create a record specifically for deletion
				const recordToDelete = await seedRecord(viewerId, 1000, 'EXPENSE', 'Test Delete');

				const response = await request(app)
					.delete(`/api/v1/records/${recordToDelete.slug}`)
					.set('Authorization', `Bearer ${adminToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
			});
		});
	});

	describe('Dashboard Endpoint Access Control', () => {
		describe('GET /api/v1/dashboard/summary', () => {
			it('VIEWER cannot access summary (403)', async () => {
				const response = await request(app)
					.get('/api/v1/dashboard/summary')
					.set('Authorization', `Bearer ${viewerToken}`);

				expect(response.status).toBe(403);
				expect(response.body.success).toBe(false);
			});

			it('ANALYST can access summary (200)', async () => {
				const response = await request(app)
					.get('/api/v1/dashboard/summary')
					.set('Authorization', `Bearer ${analystToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.data).toHaveProperty('totalIncome');
				expect(response.body.data).toHaveProperty('totalExpenses');
				expect(response.body.data).toHaveProperty('netBalance');
				expect(response.body.data).toHaveProperty('recordCount');
			});

			it('ADMIN can access summary (200)', async () => {
				const response = await request(app)
					.get('/api/v1/dashboard/summary')
					.set('Authorization', `Bearer ${adminToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
			});
		});

		describe('GET /api/v1/dashboard/categories', () => {
			it('VIEWER cannot access categories (403)', async () => {
				const response = await request(app)
					.get('/api/v1/dashboard/categories')
					.set('Authorization', `Bearer ${viewerToken}`);

				expect(response.status).toBe(403);
				expect(response.body.success).toBe(false);
			});

			it('ANALYST can access categories (200)', async () => {
				const response = await request(app)
					.get('/api/v1/dashboard/categories')
					.set('Authorization', `Bearer ${analystToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(Array.isArray(response.body.data)).toBe(true);
			});
		});

		describe('GET /api/v1/dashboard/trends', () => {
			it('VIEWER cannot access trends (403)', async () => {
				const year = new Date().getFullYear();
				const response = await request(app)
					.get(`/api/v1/dashboard/trends?year=${year}`)
					.set('Authorization', `Bearer ${viewerToken}`);

				expect(response.status).toBe(403);
				expect(response.body.success).toBe(false);
			});

			it('ANALYST can access trends (200)', async () => {
				const year = new Date().getFullYear();
				const response = await request(app)
					.get(`/api/v1/dashboard/trends?year=${year}`)
					.set('Authorization', `Bearer ${analystToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(Array.isArray(response.body.data)).toBe(true);
				expect(response.body.data.length).toBe(12); // 12 months
			});
		});

		describe('GET /api/v1/dashboard/recent', () => {
			it('VIEWER can access recent activity (200)', async () => {
				const response = await request(app)
					.get('/api/v1/dashboard/recent')
					.set('Authorization', `Bearer ${viewerToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(Array.isArray(response.body.data)).toBe(true);
			});

			it('ANALYST can access recent activity (200)', async () => {
				const response = await request(app)
					.get('/api/v1/dashboard/recent')
					.set('Authorization', `Bearer ${analystToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
			});

			it('ADMIN can access recent activity (200)', async () => {
				const response = await request(app)
					.get('/api/v1/dashboard/recent')
					.set('Authorization', `Bearer ${adminToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
			});

			it('supports limit query parameter', async () => {
				const response = await request(app)
					.get('/api/v1/dashboard/recent?limit=5')
					.set('Authorization', `Bearer ${viewerToken}`);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.data.length).toBeLessThanOrEqual(5);
			});
		});
	});
});
