import { FinancialRecord, Prisma, Role } from '@prisma/client';
import prisma from '../../config/database';
import { generateRecordSlug } from '../../utils/slug';
import type { CreateRecordInput, FilterRecordInput, UpdateRecordInput } from './record.schema';

type RecordListResult = {
	items: FinancialRecord[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

export async function getAll(userId: string, userRole: Role, filters: FilterRecordInput): Promise<RecordListResult> {
	const page = Math.max(1, filters.page ?? 1);
	const limit = Math.min(100, Math.max(1, filters.limit ?? 10));
	const skip = (page - 1) * limit;

	const where: Prisma.FinancialRecordWhereInput = buildFilterWhere(filters, userId, userRole);

	const [records, total] = await prisma.$transaction([
		prisma.financialRecord.findMany({
			where,
			skip,
			take: limit,
			orderBy: { date: 'desc' },
		}),
		prisma.financialRecord.count({ where }),
	]);

	return {
		items: records,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		},
	};
}

export async function getBySlug(slug: string, userId: string, role: Role): Promise<FinancialRecord | null> {
	const where = buildAccessWhere(userId, role);

	return prisma.financialRecord.findFirst({
		where: {
			slug,
			isDeleted: false,
			...where,
		},
	});
}

export async function create(data: CreateRecordInput, userId: string): Promise<FinancialRecord> {
	return prisma.financialRecord.create({
		data: {
			amount: new Prisma.Decimal(data.amount),
			type: data.type,
			category: data.category,
			date: new Date(data.date),
			notes: data.notes,
			slug: generateRecordSlug(data.category, data.date),
			createdBy: userId,
		},
	});
}

export async function update(
	slug: string,
	data: UpdateRecordInput,
	userId: string,
	role: Role
): Promise<FinancialRecord | null> {
	const existing = await getBySlug(slug, userId, role);

	if (!existing) {
		return null;
	}

	const nextCategory = data.category ?? existing.category;
	const nextDate = data.date ?? existing.date.toISOString();

	return prisma.financialRecord.update({
		where: { id: existing.id },
		data: {
			amount: typeof data.amount === 'number' ? new Prisma.Decimal(data.amount) : undefined,
			type: data.type,
			category: data.category,
			date: data.date ? new Date(data.date) : undefined,
			notes: data.notes,
			...(data.category || data.date ? { slug: generateRecordSlug(nextCategory, nextDate) } : {}),
		},
	});
}

export async function softDelete(slug: string, userId: string, role: Role): Promise<FinancialRecord | null> {
	const existing = await getBySlug(slug, userId, role);

	if (!existing) {
		return null;
	}

	return prisma.financialRecord.update({
		where: { id: existing.id },
		data: { isDeleted: true },
	});
}

function buildFilterWhere(filters: FilterRecordInput, userId: string, role: Role): Prisma.FinancialRecordWhereInput {
	const accessWhere = buildAccessWhere(userId, role);
	const dateWhere: Prisma.DateTimeFilter | undefined =
		filters.startDate || filters.endDate
			? {
				...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
				...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
			}
			: undefined;

	return {
		isDeleted: false,
		...accessWhere,
		...(filters.type ? { type: filters.type } : {}),
		...(filters.category ? { category: filters.category } : {}),
		...(dateWhere ? { date: dateWhere } : {}),
	};
}

function buildAccessWhere(userId: string, role: Role): Prisma.FinancialRecordWhereInput {
	if (role === Role.ADMIN || role === Role.ANALYST) {
		return {};
	}

	return { createdBy: userId };
}
