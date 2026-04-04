import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_ERROR_MESSAGES } from './auth-errors';

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface DevLoginInput {
  email: string;
  name?: string;
}

interface ForgotPasswordInput {
  email: string;
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

interface UpdateAccountInput {
  name?: string;
  email?: string;
}

function publicUser(u: { id: string; email: string; name: string | null }) {
  return { id: u.id, email: u.email, name: u.name ?? undefined };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(input: RegisterInput) {
    const email = input.email?.trim().toLowerCase();
    if (!email)
      throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
    if (!input.password || input.password.length < 6) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.passwordMinLength);
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.userAlreadyExists);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        name: input.name?.trim() || undefined,
        passwordHash,
      },
    });

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);

    return { accessToken, user: publicUser(user) };
  }

  async login(input: LoginInput) {
    const email = input.email?.trim().toLowerCase();
    if (!email)
      throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
    if (!input.password) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.passwordRequired);
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.invalidCredentials);
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.passwordlessAccount);
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.invalidCredentials);
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);

    return { accessToken, user: publicUser(user) };
  }

  async devLogin(input: DevLoginInput) {
    const email = input.email?.trim().toLowerCase();
    if (!email)
      throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: input.name?.trim() || undefined,
        },
      });
    } else if (input.name && input.name !== user.name) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { name: input.name.trim() },
      });
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);

    return { accessToken, user: publicUser(user) };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const email = input.email?.trim().toLowerCase();
    if (!email)
      throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        message: AUTH_ERROR_MESSAGES.forgotPasswordMessage,
      };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt,
      },
    });

    const resetLink = `${FRONTEND_URL.replace(/\/$/, '')}/reset-password?token=${token}`;
    let sent = false;
    try {
      sent = await this.emailService.sendPasswordReset(user.email, resetLink);
    } catch {
      sent = false;
    }

    if (process.env.NODE_ENV !== 'production' && !sent) {
      return {
        message: AUTH_ERROR_MESSAGES.forgotPasswordMessage,
        resetToken: token,
      };
    }
    return {
      message: AUTH_ERROR_MESSAGES.forgotPasswordMessage,
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    if (!input.token?.trim()) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.tokenRequired);
    }
    if (!input.password || input.password.length < 6) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.passwordMinLength);
    }

    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: input.token.trim() },
    });
    if (
      !user ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt < new Date()
    ) {
      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.invalidOrExpiredResetLink,
      );
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    return { message: 'Password has been reset. You can now sign in.' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.userNotFound);
    return publicUser(user);
  }

  async updateAccount(userId: string, input: UpdateAccountInput) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.userNotFound);

    const data: { name?: string | null; email?: string } = {};

    if (input.email !== undefined) {
      const email = input.email.trim().toLowerCase();
      if (!email) {
        throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
      }
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException(AUTH_ERROR_MESSAGES.userAlreadyExists);
      }
      data.email = email;
    }

    if (input.name !== undefined) {
      data.name = input.name?.trim() || null;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return publicUser(updated);
  }
}
