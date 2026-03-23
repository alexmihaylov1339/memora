import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaKnownRequestExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception.code === 'P2021') {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message:
          'Database schema is not applied. In Supabase: SQL Editor, run api/prisma/supabase-apply-full-schema.sql once (empty DB). Or: cd api && npx prisma migrate deploy where port 5432 works.',
      });
    }

    if (exception.code === 'P2002') {
      const target = (exception.meta?.target as string[] | undefined)?.join(
        ', ',
      );
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: target
          ? `A record with this ${target} already exists.`
          : 'A record with this value already exists.',
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error.',
    });
  }
}
