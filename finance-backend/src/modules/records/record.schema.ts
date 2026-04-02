import { RecordType } from '@prisma/client';
import { z } from 'zod';

const isoDateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
	message: 'Invalid ISO date string',
});

export const createRecordSchema = z.object({
	amount: z.number().positive('Amount must be a positive number'),
	type: z.nativeEnum(RecordType),
	category: z.string().min(1, 'Category is required'),
	date: isoDateString,
	notes: z.string().optional(),
});

export const updateRecordSchema = z
	.object({
		amount: z.number().positive('Amount must be a positive number').optional(),
		type: z.nativeEnum(RecordType).optional(),
		category: z.string().min(1, 'Category is required').optional(),
		date: isoDateString.optional(),
		notes: z.string().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field is required to update record',
	});

export const filterRecordSchema = z.object({
	type: z.nativeEnum(RecordType).optional(),
	category: z.string().optional(),
	startDate: isoDateString.optional(),
	endDate: isoDateString.optional(),
	page: z.coerce.number().int().positive().optional(),
	limit: z.coerce.number().int().positive().optional(),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type FilterRecordInput = z.infer<typeof filterRecordSchema>;
