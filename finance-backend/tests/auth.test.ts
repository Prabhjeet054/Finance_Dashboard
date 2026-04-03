/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import { resetDatabase, seedUser, disconnectDatabase } from './helpers';
import { Status } from '@prisma/client';

describe('Auth Endpoints', () => {
	beforeEach(async () => {
		await resetDatabase();
	});

	afterAll(async () => {
		await disconnectDatabase();
	});

	describe('POST /api/v1/auth/register', () => {
		it('registers a new user with valid data', async () => {
			const response = await request(app).post('/api/v1/auth/register').send({
				name: 'John Doe',
				email: 'john@example.com',
				password: 'SecurePass123',
			});

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('id');
			expect(response.body.data).toHaveProperty('slug');
			expect(response.body.data.email).toBe('john@example.com');
			expect(response.body.data.name).toBe('John Doe');
			expect(response.body.data.role).toBe('VIEWER');
			expect(response.body.data).not.toHaveProperty('passwordHash');
		});

		it('returns 422 with missing email', async () => {
			const response = await request(app).post('/api/v1/auth/register').send({
				name: 'John Doe',
				password: 'SecurePass123',
			});

			expect(response.status).toBe(422);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Validation failed');
			expect(response.body.errors).toBeDefined();
		});

		it('returns 422 with invalid email format', async () => {
			const response = await request(app).post('/api/v1/auth/register').send({
				name: 'John Doe',
				email: 'not-an-email',
				password: 'SecurePass123',
			});

			expect(response.status).toBe(422);
			expect(response.body.success).toBe(false);
		});

		it('returns 422 with password too short', async () => {
			const response = await request(app).post('/api/v1/auth/register').send({
				name: 'John Doe',
				email: 'john@example.com',
				password: 'short',
			});

			expect(response.status).toBe(422);
			expect(response.body.success).toBe(false);
		});

		it('returns 422 with name too short', async () => {
			const response = await request(app).post('/api/v1/auth/register').send({
				name: 'J',
				email: 'john@example.com',
				password: 'SecurePass123',
			});

			expect(response.status).toBe(422);
			expect(response.body.success).toBe(false);
		});

		it('returns 409 when email already exists', async () => {
			// Seed a user first
			await seedUser('Existing User', 'existing@example.com', 'Password123', 'VIEWER');

			const response = await request(app).post('/api/v1/auth/register').send({
				name: 'Another User',
				email: 'existing@example.com',
				password: 'SecurePass123',
			});

			expect(response.status).toBe(409);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toContain('Already exists');
		});
	});

	describe('POST /api/v1/auth/login', () => {
		beforeEach(async () => {
			// Seed an active user for login tests
			await seedUser('Test User', 'test@example.com', 'TestPassword123', 'VIEWER', Status.ACTIVE);
		});

		it('logs in and returns token and user', async () => {
			const response = await request(app).post('/api/v1/auth/login').send({
				email: 'test@example.com',
				password: 'TestPassword123',
			});

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('token');
			expect(response.body.data).toHaveProperty('user');
			expect(response.body.data.user.email).toBe('test@example.com');
			expect(response.body.data.user.name).toBe('Test User');
			expect(response.body.data.user.role).toBe('VIEWER');
			expect(response.body.data.user).not.toHaveProperty('passwordHash');
		});

		it('returns 401 with wrong password', async () => {
			const response = await request(app).post('/api/v1/auth/login').send({
				email: 'test@example.com',
				password: 'WrongPassword123',
			});

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toContain('Invalid credentials');
		});

		it('returns 401 with non-existent email', async () => {
			const response = await request(app).post('/api/v1/auth/login').send({
				email: 'nonexistent@example.com',
				password: 'TestPassword123',
			});

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
		});

		it('returns 401 when user is inactive', async () => {
			// Seed an inactive user
			await resetDatabase();
			await seedUser('Inactive User', 'inactive@example.com', 'InactivePass123', 'VIEWER', Status.INACTIVE);

			const response = await request(app).post('/api/v1/auth/login').send({
				email: 'inactive@example.com',
				password: 'InactivePass123',
			});

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toContain('user is inactive');
		});

		it('returns 422 with missing email', async () => {
			const response = await request(app).post('/api/v1/auth/login').send({
				password: 'TestPassword123',
			});

			expect(response.status).toBe(422);
			expect(response.body.success).toBe(false);
		});

		it('returns 422 with missing password', async () => {
			const response = await request(app).post('/api/v1/auth/login').send({
				email: 'test@example.com',
			});

			expect(response.status).toBe(422);
			expect(response.body.success).toBe(false);
		});
	});
});
