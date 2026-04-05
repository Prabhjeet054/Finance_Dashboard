import { z } from 'zod';

export const monthlyTrendsQuerySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100).optional(),
});

export const recentActivityQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type MonthlyTrendsQuery = z.infer<typeof monthlyTrendsQuerySchema>;
export type RecentActivityQuery = z.infer<typeof recentActivityQuerySchema>;
