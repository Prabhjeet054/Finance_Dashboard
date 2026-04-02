import type { Request, Response } from 'express';
import { loginWithEmailAndPassword } from './auth.service';

export async function login(req: Request, res: Response): Promise<void> {
	const { email, password } = req.body ?? {};

	if (typeof email !== 'string' || typeof password !== 'string') {
		res.status(400).json({
			success: false,
			message: 'Email and password are required',
		});
		return;
	}

	try {
		const result = await loginWithEmailAndPassword(email, password);

		res.status(200).json({
			success: true,
			data: result,
		});
	} catch {
		res.status(401).json({
			success: false,
			message: 'Invalid credentials',
		});
	}
}
