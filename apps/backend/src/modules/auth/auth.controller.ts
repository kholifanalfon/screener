import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { signJWT } from '../../core/jwt';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Registrasi berhasil',
        data: { user },
      });
    } catch (error) {
      if (error instanceof Error && !(error as any).layer) {
        (error as any).layer = 'AuthController.register';
      }
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.login(req.body);
      const token = await signJWT({ id: user.id, email: user.email, role: user.role });

      // Set cookie HTTP-only
      res.cookie('session_token', token, {
        httpOnly: true,
        secure: process.env.BE_NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      });

      res.status(200).json({
        status: 'success',
        message: 'Login berhasil',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      if (error instanceof Error && !(error as any).layer) {
        (error as any).layer = 'AuthController.login';
      }
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie('session_token', {
        httpOnly: true,
        secure: process.env.BE_NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.status(200).json({
        status: 'success',
        message: 'Logout berhasil',
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
      }

      const user = await this.authService.getUserProfile(req.user.id);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      if (error instanceof Error && !(error as any).layer) {
        (error as any).layer = 'AuthController.me';
      }
      next(error);
    }
  };
}
