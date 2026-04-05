import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './modules/auth/auth.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import recordRoutes from './modules/records/record.routes';
import userRoutes from './modules/users/user.routes';
import { env } from './config/env';
import { notFoundHandler, globalErrorHandler } from './middleware/error.middleware';

const app = express();

// Required on Railway and other reverse proxies for correct IP/rate-limit behavior.
app.set('trust proxy', 1);

const allowedOrigins = env.FRONTEND_ORIGIN.split(',')
	.map((origin) => origin.trim().replace(/\/$/, ''))
	.filter(Boolean);

app.use(helmet());
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow non-browser clients and same-origin requests with no Origin header.
			if (!origin) {
				return callback(null, true);
			}

			const normalizedOrigin = origin.replace(/\/$/, '');

			if (allowedOrigins.includes('*') || allowedOrigins.includes(normalizedOrigin)) {
				return callback(null, true);
			}

			return callback(new Error('CORS origin is not allowed'));
		},
	})
);
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

// 404 handler - must be registered before global error handler
app.use(notFoundHandler);

// Global error handler - must be registered last
app.use(globalErrorHandler);

export default app;
