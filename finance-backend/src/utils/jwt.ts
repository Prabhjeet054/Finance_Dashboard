import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

function getJwtSecret(): string {
	return env.JWT_SECRET;
}

export function signToken(payload: { userId: string; role: string }): string {
	const expiresIn = env.JWT_EXPIRES_IN as SignOptions['expiresIn'];
	return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
	const decoded = jwt.verify(token, getJwtSecret());

	if (typeof decoded === 'string') {
		throw new Error('Invalid token');
	}

	return decoded;
}
