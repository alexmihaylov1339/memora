import { BadRequestException } from '@nestjs/common';
import { hasTrimmedText, isUndefined } from '../../common/utils';
import type { DevLoginDto } from './dev-login.dto';
import type { ForgotPasswordDto } from './forgot-password.dto';
import type { LoginDto } from './login.dto';
import type { RegisterDto } from './register.dto';
import type { ResetPasswordDto } from './reset-password.dto';
import type { UpdateAccountDto } from './update-account.dto';

export function validateRegisterInput(body: RegisterDto): RegisterDto {
  if (!body || !hasTrimmedText(body.email)) {
    throw new BadRequestException('Email is required');
  }

  if (!hasTrimmedText(body.password)) {
    throw new BadRequestException('Password is required');
  }

  return {
    email: body.email.trim(),
    password: body.password,
    name: body.name?.trim(),
  };
}

export function validateLoginInput(body: LoginDto): LoginDto {
  if (!body || !hasTrimmedText(body.email)) {
    throw new BadRequestException('Email is required');
  }

  if (!hasTrimmedText(body.password)) {
    throw new BadRequestException('Password is required');
  }

  return {
    email: body.email.trim(),
    password: body.password,
  };
}

export function validateDevLoginInput(body: DevLoginDto): DevLoginDto {
  if (!body || !hasTrimmedText(body.email)) {
    throw new BadRequestException('Email is required');
  }

  return {
    email: body.email.trim(),
    name: body.name?.trim(),
  };
}

export function validateForgotPasswordInput(
  body: ForgotPasswordDto,
): ForgotPasswordDto {
  if (!body || !hasTrimmedText(body.email)) {
    throw new BadRequestException('Email is required');
  }

  return {
    email: body.email.trim(),
  };
}

export function validateResetPasswordInput(
  body: ResetPasswordDto,
): ResetPasswordDto {
  if (!body || !hasTrimmedText(body.token)) {
    throw new BadRequestException('Token is required');
  }

  if (!hasTrimmedText(body.password)) {
    throw new BadRequestException('Password is required');
  }

  return {
    token: body.token.trim(),
    password: body.password,
  };
}

export function validateUpdateAccountInput(
  body: UpdateAccountDto,
): UpdateAccountDto {
  if (!body || (isUndefined(body.name) && isUndefined(body.email))) {
    throw new BadRequestException('at least one field is required');
  }

  if (!isUndefined(body.email) && !hasTrimmedText(body.email)) {
    throw new BadRequestException('Email is required');
  }

  return {
    email: body.email?.trim(),
    name: body.name?.trim(),
  };
}
