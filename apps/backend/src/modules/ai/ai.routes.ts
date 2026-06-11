import { Router } from 'express';
import { AIController } from './ai.controller';
import { requireAuth } from '../../core/auth-middleware';

const router = Router();

// Proteksi seluruh endpoint AI agar wajib login
router.use(requireAuth);

router.post('/chat', AIController.chat);
router.post('/analyze/:ticker', AIController.analyze);

export default router;
