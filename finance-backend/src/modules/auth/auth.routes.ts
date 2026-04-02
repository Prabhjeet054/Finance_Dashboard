import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { loginHandler, registerHandler } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', validate(loginSchema), loginHandler);

export default router;
