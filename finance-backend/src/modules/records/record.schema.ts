import { RecordType } from '@prisma/client';
import { z } from 'zod';

const isoDateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
	message: 'Invalid ISO date string',
});

export const recordSlugParamSchema = z.object({
	slug: z
		.string()
		.min(3, 'Record slug is required')
		.max(200, 'Record slug is too long')
		.regex(/^[a-z0-9-]+$/, 'Record slug format is invalid'),
});

export const createRecordSchema = z.object({
	amount: z.number().positive('Amount must be a positive number'),
	type: z.nativeEnum(RecordType),
	category: z.string().trim().min(1, 'Category is required').max(100, 'Category must be at most 100 characters'),
	date: isoDateString,
	notes: z.string().trim().max(1000, 'Notes must be at most 1000 characters').optional(),
});

export const updateRecordSchema = z
	.object({
		amount: z.number().positive('Amount must be a positive number').optional(),
		type: z.nativeEnum(RecordType).optional(),
		category: z.string().trim().min(1, 'Category is required').max(100, 'Category must be at most 100 characters').optional(),
		date: isoDateString.optional(),
		notes: z.string().trim().max(1000, 'Notes must be at most 1000 characters').optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field is required to update record',
	});

export const filterRecordSchema = z
	.object({
		type: z.nativeEnum(RecordType).optional(),
		category: z.string().trim().max(100).optional(),
		startDate: isoDateString.optional(),
		endDate: isoDateString.optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().max(100).optional(),
	})
	.refine((data) => {
		if (!data.startDate || !data.endDate) {
			return true;
		}

		return new Date(data.startDate).getTime() <= new Date(data.endDate).getTime();
	}, {
		message: 'startDate must be less than or equal to endDate',
		path: ['startDate'],
	});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type FilterRecordInput = z.infer<typeof filterRecordSchema>;
