import { Router } from 'express';
import { StocksController } from './stocks.controller';
import { requireAuth } from '../../core/auth-middleware';

const router = Router();

// Proteksi seluruh rute saham dengan middleware requireAuth
router.use(requireAuth);

router.get('/', StocksController.list);
router.get('/screener', StocksController.screen);
router.get('/:ticker', StocksController.getDetails);

export default router;
