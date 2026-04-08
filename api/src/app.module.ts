import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DecksController } from './decks/decks.controller';
import { DecksService } from './decks/decks.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { ChunksModule } from './chunks/chunks.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SearchController } from './search/search.controller';
import { SearchService } from './search/search.service';

@Module({
  imports: [PrismaModule, AuthModule, CardsModule, ChunksModule, ReviewsModule],
  controllers: [AppController, DecksController, SearchController],
  providers: [AppService, DecksService, SearchService],
})
export class AppModule {}
