import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ChunksService } from './chunks.service';

@Controller('chunks')
@UseGuards(AuthGuard)
export class ChunksController {
  constructor(private readonly chunks: ChunksService) {}

  @Get('status')
  status() {
    return this.chunks.getStatus();
  }
}
