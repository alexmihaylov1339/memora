import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma.module';
import { ChunksController } from './chunks.controller';
import { ChunksService } from './chunks.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ChunksController],
  providers: [ChunksService],
  exports: [ChunksService],
})
export class ChunksModule {}
