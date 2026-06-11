import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.schema';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(input: RegisterInput) {
    const existingUser = await this.authRepository.findByEmail(input.email);
    if (existingUser) {
      const error: any = new Error('Email sudah terdaftar');
      error.statusCode = 400;
      error.layer = 'AuthService';
      throw error;
    }

    const passwordHash = await Bun.password.hash(input.password, {
      algorithm: 'bcrypt',
      cost: 10,
    });

    const newUser = await this.authRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName || null,
      role: 'user',
    });

    // Omit passwordHash from output
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(input: LoginInput) {
    const user = await this.authRepository.findByEmail(input.email);
    if (!user) {
      const error: any = new Error('Email atau password salah');
      error.statusCode = 401;
      error.layer = 'AuthService';
      throw error;
    }

    const isPasswordValid = await Bun.password.verify(input.password, user.passwordHash);
    if (!isPasswordValid) {
      const error: any = new Error('Email atau password salah');
      error.statusCode = 401;
      error.layer = 'AuthService';
      throw error;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserProfile(id: number) {
    const user = await this.authRepository.findById(id);
    if (!user) {
      const error: any = new Error('Pengguna tidak ditemukan');
      error.statusCode = 404;
      error.layer = 'AuthService';
      throw error;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
