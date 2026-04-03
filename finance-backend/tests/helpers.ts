import prisma from '../src/config/database';
import { generateUserSlug, generateRecordSlug } from '../src/utils/slug';
import { signToken } from '../src/utils/jwt';
import bcryptjs from 'bcryptjs';
import { Role, Status } from '@prisma/client';

export async function resetDatabase() {
	// Delete in reverse order of dependencies
	await prisma.financialRecord.deleteMany();
	await prisma.user.deleteMany();
}

export async function seedUser(
	name: string,
	email: string,
	password: string,
	role: Role,
	status: Status = Status.ACTIVE
) {
	const slug = generateUserSlug(name);
	const hashedPassword = await bcryptjs.hash(password, 10);

	return prisma.user.create({
		data: {
			name,
			email,
			passwordHash: hashedPassword,
			role,
			status,
			slug,
		},
	});
}

export async function seedRecord(
	userId: string,
	amount: number,
	type: 'INCOME' | 'EXPENSE',
	category: string,
	date: Date = new Date()
) {
	const slug = generateRecordSlug(category, date.toISOString().split('T')[0]);

	return prisma.financialRecord.create({
		data: {
			amount,
			type,
			category,
			date,
			slug,
			createdBy: userId,
		},
	});
}

export async function generateAuthToken(userId: string, role: Role): Promise<string> {
	return signToken({ userId, role });
}

export async function disconnectDatabase() {
	await prisma.$disconnect();
}
