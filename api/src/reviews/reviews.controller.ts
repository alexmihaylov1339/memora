import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { ReviewsService } from './reviews.service';
import type { GradeReviewDto } from './dto/grade-review.dto';
import { serializeGradeReviewResponse } from './dto/grade-review-response.dto';
import {
  serializePracticeResponse,
  serializeReviewQueueResponse,
} from './dto/review-queue-response.dto';
import type { ReviewCardIdParamDto } from './dto/review-card-id-param.dto';
import type { ReviewDeckQueryDto } from './dto/review-query.dto';
import {
  validateGradeReviewInput,
  validateReviewCardId,
  validateReviewDeckId,
} from './dto/review-validation';

@Controller('reviews')
@UseGuards(AuthGuard)
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('queue')
  async queue(
    @CurrentUser() user: AuthUser,
    @Query() query: ReviewDeckQueryDto,
  ) {
    const deckId = validateReviewDeckId(query.deckId);
    const items = await this.reviews.getEligibleQueueItems(
      user.id,
      new Date(),
      deckId,
    );

    return serializeReviewQueueResponse(items);
  }

  @Get('practice')
  async practice(
    @CurrentUser() user: AuthUser,
    @Query() query: ReviewDeckQueryDto,
  ) {
    const deckId = validateReviewDeckId(query.deckId);
    const items = await this.reviews.getPracticeItems(user.id, deckId);

    return serializePracticeResponse(items);
  }

  @Post(':cardId/grade')
  @HttpCode(HttpStatus.OK)
  async grade(
    @CurrentUser() user: AuthUser,
    @Param() params: ReviewCardIdParamDto,
    @Query() query: ReviewDeckQueryDto,
    @Body() body: GradeReviewDto,
  ) {
    const cardId = validateReviewCardId(params.cardId);
    const deckId = validateReviewDeckId(query.deckId);
    const grade = validateGradeReviewInput(body);
    const result = await this.reviews.gradeReview(
      cardId,
      grade,
      user.id,
      new Date(),
      deckId,
    );

    return serializeGradeReviewResponse(result);
  }
}
