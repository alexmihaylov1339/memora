import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DecksController } from './decks.controller';

@Module({
  imports: [],
  controllers: [AppController, DecksController],
  providers: [AppService],
})
export class AppModule {}
