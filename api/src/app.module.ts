import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DecksController } from './decks/decks.controller';
import { DecksService } from './decks/decks.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController, DecksController],
  providers: [AppService, DecksService],
})
export class AppModule {}
