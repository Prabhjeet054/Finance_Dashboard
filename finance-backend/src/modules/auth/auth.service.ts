import bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';
import prisma from '../../config/database';
import { signToken } from '../../utils/jwt';

export type LoginResult = {
	token: string;
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
		status: string;
		slug: string;
	};
};

export async function loginWithEmailAndPassword(email: string, password: string): Promise<LoginResult> {
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

	return {
		token: signToken({ userId: user.id, role: user.role }),
		user: mapUser(user),
	};
}

function mapUser(user: User): LoginResult['user'] {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		status: user.status,
		slug: user.slug,
	};
}
