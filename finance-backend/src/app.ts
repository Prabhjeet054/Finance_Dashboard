import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './modules/auth/auth.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import recordRoutes from './modules/records/record.routes';
import userRoutes from './modules/users/user.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 100,
		standardHeaders: true,
		legacyHeaders: false,
	})
);
app.use(morgan('dev'));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	const message = err instanceof Error ? err.message : 'Internal Server Error';

	res.status(500).json({
		success: false,
		message,
	});
});

export default app;
