import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from './jwt';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map((cookie) => {
      const [key, ...value] = cookie.split('=');
      return [key.trim(), value.join('=')];
    })
  );
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Dapatkan token dari cookies
  const cookies = parseCookies(req.headers.cookie);
  token = cookies['session_token'];

  // 2. Fallback ke Authorization header
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Sesi tidak ditemukan atau kedaluwarsa',
    });
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Token tidak valid',
    });
  }

  req.user = {
    id: payload.id as number,
    email: payload.email as string,
    role: payload.role as string,
  };

  next();
}

export function requireRole(role: 'admin' | 'user') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Hak akses tidak mencukupi',
      });
    }

    next();
  };
}
