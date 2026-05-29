import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CardAssetsService } from '../cards/card-assets.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [AuthModule],
  controllers: [ReviewsController],
  providers: [CardAssetsService, ReviewsService],
})
export class ReviewsModule {}
