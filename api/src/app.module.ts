import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DecksController } from './decks/decks.controller';
import { DecksService } from './decks/decks.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, DecksController],
  providers: [AppService, DecksService, PrismaService],
})
export class AppModule {}
