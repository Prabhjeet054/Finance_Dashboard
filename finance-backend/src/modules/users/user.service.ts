import bcrypt from 'bcryptjs';
import { Prisma, Status, User } from '@prisma/client';
import prisma from '../../config/database';
import { generateUserSlug } from '../../utils/slug';
import type { CreateUserInput, UpdateUserInput } from './user.schema';

const SALT_ROUNDS = 10;

type SafeUser = Omit<User, 'passwordHash'>;

export type UserListFilters = {
	page?: number;
	limit?: number;
};

export type UserListResult = {
	items: SafeUser[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

export async function getAll(filters: UserListFilters): Promise<UserListResult> {
	const page = Math.max(1, Number(filters.page) || 1);
	const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));
	const skip = (page - 1) * limit;

	const [users, total] = await prisma.$transaction([
		prisma.user.findMany({
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.user.count(),
	]);

	return {
		items: users.map(toSafeUser),
		meta: {
			page,
			limit,
			total,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		},
	};
}

export async function getBySlug(slug: string): Promise<SafeUser | null> {
	const user = await prisma.user.findUnique({
		where: { slug },
	});

	return user ? toSafeUser(user) : null;
}

export async function create(data: CreateUserInput): Promise<SafeUser> {
	const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

	try {
		const createdUser = await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				passwordHash,
				role: data.role,
				slug: generateUserSlug(data.name),
			},
		});

		return toSafeUser(createdUser);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			throw new Error('User with this email already exists');
		}

		throw error;
	}
}

export async function update(slug: string, data: UpdateUserInput): Promise<SafeUser | null> {
	const existingUser = await prisma.user.findUnique({
		where: { slug },
	});

	if (!existingUser) {
		return null;
	}

	const updatedUser = await prisma.user.update({
		where: { slug },
		data: {
			name: data.name,
			status: data.status,
			role: data.role,
			...(data.name ? { slug: generateUserSlug(data.name) } : {}),
		},
	});

	return toSafeUser(updatedUser);
}

export async function deactivate(slug: string): Promise<SafeUser | null> {
	const existingUser = await prisma.user.findUnique({
		where: { slug },
	});

	if (!existingUser) {
		return null;
	}

	const updatedUser = await prisma.user.update({
		where: { slug },
		data: {
			status: Status.INACTIVE,
		},
	});

	return toSafeUser(updatedUser);
}

function toSafeUser(user: User): SafeUser {
	const { passwordHash: _passwordHash, ...safeUser } = user;
	return safeUser;
}
