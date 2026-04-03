import { Prisma, RecordType } from '@prisma/client';
import prisma from '../../config/database';

type SummaryResult = {
	totalIncome: number;
	totalExpenses: number;
	netBalance: number;
	recordCount: number;
};

type CategoryBreakdown = {
	category: string;
	totalAmount: number;
	count: number;
};

type MonthlyTrend = {
	month: number;
	income: number;
	expenses: number;
};

type RecentActivityRecord = {
	id: string;
	amount: string;
	type: RecordType;
	category: string;
	date: string;
	notes: string | null;
	userName: string;
};

export async function getSummary(): Promise<SummaryResult> {
	const records = await prisma.financialRecord.findMany({
		where: { isDeleted: false },
		select: {
			amount: true,
			type: true,
		},
	});

	let totalIncome = 0;
	let totalExpenses = 0;

	for (const record of records) {
		const amount = Number(record.amount);
		if (record.type === 'INCOME') {
			totalIncome += amount;
		} else {
			totalExpenses += amount;
		}
	}

	return {
		totalIncome,
		totalExpenses,
		netBalance: totalIncome - totalExpenses,
		recordCount: records.length,
	};
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
	const records = await prisma.financialRecord.findMany({
		where: { isDeleted: false },
		select: {
			category: true,
			amount: true,
		},
	});

	const categoryMap = new Map<string, { total: number; count: number }>();

	for (const record of records) {
		const amount = Number(record.amount);
		const existing = categoryMap.get(record.category);

		if (existing) {
			categoryMap.set(record.category, {
				total: existing.total + amount,
				count: existing.count + 1,
			});
		} else {
			categoryMap.set(record.category, {
				total: amount,
				count: 1,
			});
		}
	}

	return Array.from(categoryMap.entries()).map(([category, { total, count }]) => ({
		category,
		totalAmount: total,
		count,
	}));
}

export async function getMonthlyTrends(year: number): Promise<MonthlyTrend[]> {
	const startDate = new Date(`${year}-01-01`);
	const endDate = new Date(`${year}-12-31T23:59:59`);

	const records = await prisma.financialRecord.findMany({
		where: {
			isDeleted: false,
			date: {
				gte: startDate,
				lte: endDate,
			},
		},
		select: {
			date: true,
			type: true,
			amount: true,
		},
	});

	const monthlyMap = new Map<number, { income: number; expenses: number }>();

	// Initialize all 12 months
	for (let month = 1; month <= 12; month++) {
		monthlyMap.set(month, { income: 0, expenses: 0 });
	}

	// Aggregate by month
	for (const record of records) {
		const month = record.date.getMonth() + 1; // getMonth() is 0-indexed
		const amount = Number(record.amount);
		const monthData = monthlyMap.get(month) || { income: 0, expenses: 0 };

		if (record.type === 'INCOME') {
			monthData.income += amount;
		} else {
			monthData.expenses += amount;
		}

		monthlyMap.set(month, monthData);
	}

	// Convert to array format
	const trends: MonthlyTrend[] = [];
	for (let month = 1; month <= 12; month++) {
		const data = monthlyMap.get(month) || { income: 0, expenses: 0 };
		trends.push({
			month,
			income: data.income,
			expenses: data.expenses,
		});
	}

	return trends;
}

export async function getRecentActivity(limit: number = 10): Promise<RecentActivityRecord[]> {
	const records = await prisma.financialRecord.findMany({
		where: { isDeleted: false },
		include: {
			user: {
				select: { name: true },
			},
		},
		orderBy: { createdAt: 'desc' },
		take: limit,
	});

	return records.map((record) => ({
		id: record.id,
		amount: record.amount.toString(),
		type: record.type,
		category: record.category,
		date: record.date.toISOString(),
		notes: record.notes,
		userName: record.user.name,
	}));
}
