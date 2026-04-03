import { execSync } from 'child_process';

/**
 * Jest setup file for PostgreSQL test database.
 * Requires TEST_DATABASE_URL to be set.
 */
try {
	process.env.NODE_ENV = 'test';

	if (!process.env.TEST_DATABASE_URL) {
		throw new Error('TEST_DATABASE_URL is required for tests.');
	}

	process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

	// Reset and sync schema on dedicated PostgreSQL test DB.
	execSync('npx prisma db push --skip-generate --force-reset', {
		cwd: process.cwd(),
		stdio: 'inherit',
		env: { ...process.env },
	});
} catch (error) {
	console.error('Failed to initialize PostgreSQL test environment:', error);
	process.exit(1);
}

