import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

function getJwtSecret(): string {
	if (!JWT_SECRET) {
		throw new Error('JWT_SECRET is not configured');
	}

	return JWT_SECRET;
}

export function signToken(payload: { userId: string; role: string }): string {
	return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
	const decoded = jwt.verify(token, getJwtSecret());

	if (typeof decoded === 'string') {
		throw new Error('Invalid token');
	}

	return decoded;
}
