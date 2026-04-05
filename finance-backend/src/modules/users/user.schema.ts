import { Role, Status } from '@prisma/client';
import { z } from 'zod';

const assignableRoleSchema = z.enum([Role.VIEWER, Role.ANALYST]);

export const userSlugParamSchema = z.object({
	slug: z
		.string()
		.min(3, 'User slug is required')
		.max(200, 'User slug is too long')
		.regex(/^[a-z0-9-]+$/, 'User slug format is invalid'),
});

export const userListQuerySchema = z.object({
	page: z.coerce.number().int().positive().optional(),
	limit: z.coerce.number().int().positive().max(100).optional(),
});

export const createUserSchema = z.object({
	name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name must be at most 100 characters'),
	email: z.string().trim().toLowerCase().email('Invalid email address').max(255, 'Email must be at most 255 characters'),
	password: z.string().min(8, 'Password must be at least 8 characters long').max(128, 'Password must be at most 128 characters'),
	role: assignableRoleSchema.optional().default(Role.VIEWER),
});

export const updateUserSchema = z
	.object({
		name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name must be at most 100 characters').optional(),
		status: z.nativeEnum(Status).optional(),
		role: assignableRoleSchema.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field is required to update user',
	});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
