import { z } from 'zod';

export const registerSchema = z.object({
	name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name must be at most 100 characters'),
	email: z.string().trim().toLowerCase().email('Invalid email address').max(255, 'Email must be at most 255 characters'),
	password: z.string().min(8, 'Password must be at least 8 characters long').max(128, 'Password must be at most 128 characters'),
});

export const loginSchema = z.object({
	email: z.string().trim().toLowerCase().email('Invalid email address').max(255, 'Email must be at most 255 characters'),
	password: z.string().min(1, 'Password is required').max(128, 'Password must be at most 128 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
