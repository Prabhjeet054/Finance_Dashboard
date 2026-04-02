import bcrypt from 'bcryptjs';
import { Prisma, Role, Status, User } from '@prisma/client';
import prisma from '../../config/database';
import { generateUserSlug } from '../../utils/slug';
import { signToken } from '../../utils/jwt';
import type { RegisterInput } from './auth.schema';

const SALT_ROUNDS = 10;

export type SafeUser = Omit<User, 'passwordHash'>;

export type AuthResult = {
	user: SafeUser;
	token: string;
};

export async function register(data: RegisterInput): Promise<SafeUser> {
	const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

	try {
		const createdUser = await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				passwordHash,
				slug: generateUserSlug(data.name),
				role: Role.VIEWER,
			},
		});

		return toSafeUser(createdUser);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			throw new Error('Email is already registered');
		}

		throw error;
	}
}

export async function login(email: string, password: string): Promise<AuthResult> {
	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error('Invalid credentials');
	}

	const passwordMatches = await bcrypt.compare(password, user.passwordHash);

	if (!passwordMatches) {
		throw new Error('Invalid credentials');
	}

	if (user.status === Status.INACTIVE) {
		throw new Error('User account is inactive');
	}

	return {
		token: signToken({ userId: user.id, role: user.role }),
		user: toSafeUser(user),
	};
}

function toSafeUser(user: User): SafeUser {
	const { passwordHash: _passwordHash, ...safeUser } = user;

	return safeUser;
}
