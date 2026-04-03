/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import { resetDatabase, seedUser, seedRecord, generateAuthToken, disconnectDatabase } from './helpers';
import { Role } from '@prisma/client';

describe('Dashboard Analytics Endpoints', () => {
	let adminId: string;
	let adminToken: string;

	beforeAll(async () => {
		await resetDatabase();

		// Seed admin user
		const adminUser = await seedUser('Admin User', 'admin@example.com', 'AdminPass123', Role.ADMIN);
		adminId = adminUser.id;
		adminToken = await generateAuthToken(adminId, Role.ADMIN);
	});

	afterAll(async () => {
		await disconnectDatabase();
	});

	describe('GET /api/v1/dashboard/summary', () => {
		beforeEach(async () => {
			// Clear records before each test
			await resetDatabase();

			// Re-seed the admin user
			const adminUser = await seedUser('Admin User', 'admin@example.com', 'AdminPass123', Role.ADMIN);
			adminId = adminUser.id;
			adminToken = await generateAuthToken(adminId, Role.ADMIN);
		});

		it('returns correct totalIncome, totalExpenses, and netBalance', async () => {
			// Seed 3 INCOME and 2 EXPENSE records with known amounts
			// INCOME: $5000 + $3000 + $2000 = $10,000
			// EXPENSE: $1500 + $800 = $2,300
			// NET: $10,000 - $2,300 = $7,700
			await seedRecord(adminId, 5000, 'INCOME', 'Salary', new Date('2024-01-15'));
			await seedRecord(adminId, 3000, 'INCOME', 'Bonus', new Date('2024-02-20'));
			await seedRecord(adminId, 2000, 'INCOME', 'Freelance', new Date('2024-03-10'));
			await seedRecord(adminId, 1500, 'EXPENSE', 'Rent', new Date('2024-01-20'));
			await seedRecord(adminId, 800, 'EXPENSE', 'Utilities', new Date('2024-02-15'));

			const response = await request(app)
				.get('/api/v1/dashboard/summary')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('totalIncome');
			expect(response.body.data).toHaveProperty('totalExpenses');
			expect(response.body.data).toHaveProperty('netBalance');
			expect(response.body.data).toHaveProperty('recordCount');

			expect(response.body.data.totalIncome).toBe(10000);
			expect(response.body.data.totalExpenses).toBe(2300);
			expect(response.body.data.netBalance).toBe(7700);
			expect(response.body.data.recordCount).toBe(5);
		});

		it('excludes soft-deleted records from summary', async () => {
			// Seed records
			const record1 = await seedRecord(adminId, 5000, 'INCOME', 'Salary', new Date('2024-01-15'));
			await seedRecord(adminId, 1000, 'EXPENSE', 'Rent', new Date('2024-01-20'));

			// Delete one record via API
			await request(app)
				.delete(`/api/v1/records/${record1.slug}`)
				.set('Authorization', `Bearer ${adminToken}`);

			// Get summary - deleted record should not be counted
			const response = await request(app)
				.get('/api/v1/dashboard/summary')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.totalIncome).toBe(0); // Deleted income not counted
			expect(response.body.data.totalExpenses).toBe(1000);
			expect(response.body.data.recordCount).toBe(1);
		});
	});

	describe('GET /api/v1/dashboard/categories', () => {
		beforeEach(async () => {
			// Clear records before each test
			await resetDatabase();

			// Re-seed the admin user
			const adminUser = await seedUser('Admin User', 'admin@example.com', 'AdminPass123', Role.ADMIN);
			adminId = adminUser.id;
			adminToken = await generateAuthToken(adminId, Role.ADMIN);
		});

		it('groups and sums by category correctly', async () => {
			// Seed records with known categories and amounts
			// Salary: $5000 + $6000 = $11,000 (2 records)
			// Rent: $1500 + $1200 = $2,700 (2 records)
			// Utilities: $800 (1 record)
			// Groceries: $500 (1 record)
			await seedRecord(adminId, 5000, 'INCOME', 'Salary', new Date('2024-01-15'));
			await seedRecord(adminId, 1500, 'EXPENSE', 'Rent', new Date('2024-01-20'));
			await seedRecord(adminId, 1200, 'EXPENSE', 'Rent', new Date('2024-02-20'));
			await seedRecord(adminId, 800, 'EXPENSE', 'Utilities', new Date('2024-02-15'));
			await seedRecord(adminId, 500, 'EXPENSE', 'Groceries', new Date('2024-03-05'));
			await seedRecord(adminId, 6000, 'INCOME', 'Salary', new Date('2024-07-01'));

			const response = await request(app)
				.get('/api/v1/dashboard/categories')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(Array.isArray(response.body.data)).toBe(true);

			const categories = response.body.data;

			// Find each category and verify totals
			const salaryCategory = categories.find((c: any) => c.category === 'Salary');
			expect(salaryCategory).toEqual({
				category: 'Salary',
				totalAmount: 11000,
				count: 2,
			});

			const rentCategory = categories.find((c: any) => c.category === 'Rent');
			expect(rentCategory).toEqual({
				category: 'Rent',
				totalAmount: 2700,
				count: 2,
			});

			const utilitiesCategory = categories.find((c: any) => c.category === 'Utilities');
			expect(utilitiesCategory).toEqual({
				category: 'Utilities',
				totalAmount: 800,
				count: 1,
			});

			const groceriesCategory = categories.find((c: any) => c.category === 'Groceries');
			expect(groceriesCategory).toEqual({
				category: 'Groceries',
				totalAmount: 500,
				count: 1,
			});
		});
	});

	describe('GET /api/v1/dashboard/trends?year=2024', () => {
		beforeEach(async () => {
			// Clear records before each test
			await resetDatabase();

			// Re-seed the admin user
			const adminUser = await seedUser('Admin User', 'admin@example.com', 'AdminPass123', Role.ADMIN);
			adminId = adminUser.id;
			adminToken = await generateAuthToken(adminId, Role.ADMIN);
		});

		it('returns 12 months with correct income and expense totals', async () => {
			// Seed records across different months in 2024
			// January: $5000 INCOME, $1500 EXPENSE
			// February: $3000 INCOME, $800 EXPENSE
			// March: $0, $500 EXPENSE
			// Other months: $0, $0
			await seedRecord(adminId, 5000, 'INCOME', 'Salary', new Date('2024-01-15'));
			await seedRecord(adminId, 1500, 'EXPENSE', 'Rent', new Date('2024-01-20'));
			await seedRecord(adminId, 3000, 'INCOME', 'Bonus', new Date('2024-02-10'));
			await seedRecord(adminId, 800, 'EXPENSE', 'Utilities', new Date('2024-02-15'));
			await seedRecord(adminId, 500, 'EXPENSE', 'Groceries', new Date('2024-03-05'));

			const response = await request(app)
				.get('/api/v1/dashboard/trends?year=2024')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(Array.isArray(response.body.data)).toBe(true);
			expect(response.body.data).toHaveLength(12); // 12 months

			const trends = response.body.data;

			// Verify January (month 1)
			expect(trends[0]).toEqual({
				month: 1,
				income: 5000,
				expenses: 1500,
			});

			// Verify February (month 2)
			expect(trends[1]).toEqual({
				month: 2,
				income: 3000,
				expenses: 800,
			});

			// Verify March (month 3)
			expect(trends[2]).toEqual({
				month: 3,
				income: 0,
				expenses: 500,
			});

			// Verify remaining months are all zeros
			for (let i = 3; i < 12; i++) {
				expect(trends[i]).toEqual({
					month: i + 1,
					income: 0,
					expenses: 0,
				});
			}
		});

		it('returns trends for specified year only', async () => {
			// Seed records in 2024
			await seedRecord(adminId, 5000, 'INCOME', 'Salary', new Date('2024-01-15'));

			// Try to fetch 2023 trends (should all be zero)
			const response2023 = await request(app)
				.get('/api/v1/dashboard/trends?year=2023')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response2023.status).toBe(200);
			const trends2023 = response2023.body.data;

			// Verify all months in 2023 are zero
			for (let i = 0; i < 12; i++) {
				expect(trends2023[i]).toEqual({
					month: i + 1,
					income: 0,
					expenses: 0,
				});
			}
		});

		it('validates year parameter', async () => {
			const response = await request(app)
				.get('/api/v1/dashboard/trends?year=invalid')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});

		it('uses current year when year parameter is not provided', async () => {
			const currentYear = new Date().getFullYear();

			// Seed a record for current year
			await seedRecord(adminId, 1000, 'INCOME', 'Test', new Date());

			const response = await request(app)
				.get('/api/v1/dashboard/trends')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			const trends = response.body.data;

			// Verify current month has the record
			const currentMonth = new Date().getMonth() + 1;
			expect(trends[currentMonth - 1].income).toBeGreaterThanOrEqual(1000);
		});
	});

	describe('GET /api/v1/dashboard/recent', () => {
		beforeEach(async () => {
			// Clear records before each test
			await resetDatabase();

			// Re-seed the admin user
			const adminUser = await seedUser('Admin User', 'admin@example.com', 'AdminPass123', Role.ADMIN);
			adminId = adminUser.id;
			adminToken = await generateAuthToken(adminId, Role.ADMIN);
		});

		it('returns most recent records sorted by createdAt descending', async () => {
			// Seed records with delays to ensure different timestamps
			const record1 = await seedRecord(adminId, 1000, 'INCOME', 'First', new Date('2024-01-01'));
			await new Promise((r) => setTimeout(r, 10));
			const record2 = await seedRecord(adminId, 2000, 'EXPENSE', 'Second', new Date('2024-02-01'));
			await new Promise((r) => setTimeout(r, 10));
			const record3 = await seedRecord(adminId, 3000, 'INCOME', 'Third', new Date('2024-03-01'));

			const response = await request(app)
				.get('/api/v1/dashboard/recent')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(Array.isArray(response.body.data)).toBe(true);

			const recent = response.body.data;

			// Most recent record should be first
			expect(recent[0].id).toBe(record3.id);
			expect(recent[1].id).toBe(record2.id);
			expect(recent[2].id).toBe(record1.id);
		});

		it('returns at most 10 records by default', async () => {
			// Seed 15 records
			for (let i = 0; i < 15; i++) {
				await seedRecord(adminId, 1000 * (i + 1), 'INCOME', `Record${i}`, new Date(`2024-01-${String((i % 31) + 1).padStart(2, '0')}`));
			}

			const response = await request(app)
				.get('/api/v1/dashboard/recent')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(10);
		});

		it('respects limit query parameter', async () => {
			// Seed 15 records
			for (let i = 0; i < 15; i++) {
				await seedRecord(adminId, 1000, 'INCOME', `Record${i}`, new Date(`2024-01-${String((i % 31) + 1).padStart(2, '0')}`));
			}

			const response = await request(app)
				.get('/api/v1/dashboard/recent?limit=5')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(5);
		});

		it('includes userName in recent activity records', async () => {
			await seedRecord(adminId, 1000, 'INCOME', 'Test', new Date('2024-01-15'));

			const response = await request(app)
				.get('/api/v1/dashboard/recent')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data[0]).toHaveProperty('userName');
			expect(response.body.data[0].userName).toBe('Admin User');
		});

		it('excludes soft-deleted records from recent activity', async () => {
			const record1 = await seedRecord(adminId, 1000, 'INCOME', 'Recent', new Date('2024-01-20'));
			const record2 = await seedRecord(adminId, 2000, 'EXPENSE', 'ToDelete', new Date('2024-01-10'));

			// Delete the record
			await request(app)
				.delete(`/api/v1/records/${record2.slug}`)
				.set('Authorization', `Bearer ${adminToken}`);

			const response = await request(app)
				.get('/api/v1/dashboard/recent')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(1); // Only non-deleted record
			expect(response.body.data[0].id).toBe(record1.id);
		});
	});
});
