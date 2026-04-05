import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().int().positive().default(3000),
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
	JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
	JWT_EXPIRES_IN: z.string().default('7d'),
	BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(10),
	TEST_DATABASE_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
