import express from 'express';
import cors from 'cors';
import { config } from './core/config';
import { logger } from './core/logger';
import { errorHandler } from './core/middleware';
import authRoutes from './modules/auth/auth.routes';
import stockRoutes from './modules/stocks/stocks.routes';
import { requireAuth } from './core/auth-middleware';
import { validateSignature } from './core/middlewares/signature.middleware';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

// Signature verification middleware
app.use(validateSignature);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stocks', stockRoutes);

// Request logging middleware
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', requireAuth, (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require('../package.json');
  res.json({
    name: 'Screener-Trade API',
    message: 'Welcome to the Screener-Trade Backend Services!',
    versions: {
      bun: Bun.version,
      node: process.versions.node,
      express: pkg.dependencies?.express?.replace(/[\^~]/g, '') || 'unknown'
    },
    environment: config.env,
    timestamp: new Date()
  });
});

// Global Error Handler
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Backend server is running on port ${config.port} in ${config.env} mode`);
});
