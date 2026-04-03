import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Jest setup file - runs before all tests
 * Resets the test database schema
 */

async function setupTests() {
	try {
		// Set test environment
		process.env.NODE_ENV = 'test';

		// Use TEST_DATABASE_URL if available, otherwise use a test SQLite database
		if (!process.env.DATABASE_URL) {
			const testDbPath = path.join(__dirname, '..', 'test.db');

			// Clean up old test database if it exists
			if (fs.existsSync(testDbPath)) {
				fs.unlinkSync(testDbPath);
			}

			process.env.DATABASE_URL = `file:${testDbPath}`;
		}

		console.log('Setting up test database...');

		// Push Prisma schema to test database
		try {
			execSync('npx prisma db push --skip-generate --force-reset', {
				cwd: process.cwd(),
				stdio: 'inherit',
				env: { ...process.env },
			});
		} catch (error) {
			console.warn('Note: If using PostgreSQL, make sure the test database is running');
			throw error;
		}

		console.log('Test database initialized successfully');
	} catch (error) {
		console.error('Test setup error:', error instanceof Error ? error.message : error);
		// Don't exit - let Jest proceed, tests will fail with better error messages
	}
}

// Run setup synchronously
try {
	process.env.NODE_ENV = 'test';

	// Set up test database URL
	if (!process.env.DATABASE_URL) {
		const testDbPath = path.join(__dirname, '..', 'test.db');
		if (fs.existsSync(testDbPath)) {
			fs.unlinkSync(testDbPath);
		}
		process.env.DATABASE_URL = `file:${testDbPath}`;
	}
} catch (error) {
	console.error('Failed to initialize test environment:', error);
}

