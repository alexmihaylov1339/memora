import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { PrismaKnownRequestExceptionFilter } from './prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new PrismaKnownRequestExceptionFilter());

  // Enable CORS for frontend access
  app.enableCors({
    origin: [
      'http://localhost:3000', // Next.js frontend
      'http://localhost:4000', // API itself (if needed)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Set global API prefix
  app.setGlobalPrefix('v1');

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
