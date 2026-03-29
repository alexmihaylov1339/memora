import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChunksController } from './chunks.controller';
import { ChunksService } from './chunks.service';

@Module({
  imports: [AuthModule],
  controllers: [ChunksController],
  providers: [ChunksService],
})
export class ChunksModule {}
