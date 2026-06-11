import { Router } from 'express';
import { AuthController } from './auth.controller';
import { RegisterSchema, LoginSchema } from './auth.schema';
import { validateBody } from '../../core/middleware';
import { requireAuth } from '../../core/auth-middleware';

const router = Router();
const controller = new AuthController();

router.post('/register', validateBody(RegisterSchema), controller.register);
router.post('/login', validateBody(LoginSchema), controller.login);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.me);

export default router;
