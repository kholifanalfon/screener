import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export function validateSignature(req: Request, res: Response, next: NextFunction) {
  // Bypass signature check untuk health check endpoint
  if (req.path === '/health') {
    return next();
  }

  const clientSignature = req.headers['x-app-signature'];
  const serverSignature = process.env.BE_APP_SIGNATURE;

  if (!serverSignature) {
    logger.error('BE_APP_SIGNATURE environment variable is not defined!');
    return res.status(500).json({
      status: 'error',
      message: 'Server Configuration Error: Signature key missing',
    });
  }

  if (clientSignature !== serverSignature) {
    logger.warn(
      {
        path: req.path,
        ip: req.ip,
        signatureProvided: clientSignature ? 'yes' : 'no',
      },
      'Access blocked: Invalid or missing X-App-Signature header'
    );

    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: Direct API access is blocked',
    });
  }

  next();
}
