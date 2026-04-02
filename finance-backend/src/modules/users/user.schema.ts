import { Role, Status } from '@prisma/client';
import { z } from 'zod';

export const createUserSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters long'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
	role: z.nativeEnum(Role).optional().default(Role.VIEWER),
});

export const updateUserSchema = z
	.object({
		name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
		status: z.nativeEnum(Status).optional(),
		role: z.nativeEnum(Role).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field is required to update user',
	});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
