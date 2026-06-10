import express from 'express';
import cors from 'cors';
import { config } from './core/config';
import { logger } from './core/logger';
import { errorHandler } from './core/middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
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
