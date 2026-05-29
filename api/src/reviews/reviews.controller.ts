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
import {
  serializeSubmitWhatDidYouHearResponse,
  serializeWhatDidYouHearRoundResponse,
} from './what-did-you-hear/what-did-you-hear-response.dto';
import {
  validateWhatDidYouHearSubmitInput,
  type SubmitWhatDidYouHearResultDto,
} from './what-did-you-hear/what-did-you-hear-validation';

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

  @Get('what-did-you-hear')
  async whatDidYouHear(
    @CurrentUser() user: AuthUser,
    @Query() query: ReviewDeckQueryDto,
  ) {
    const deckId = validateReviewDeckId(query.deckId);
    const result = await this.reviews.getWhatDidYouHearQuizRound(
      user.id,
      deckId,
      new Date(),
    );

    return serializeWhatDidYouHearRoundResponse(result);
  }

  @Post('what-did-you-hear/:cardId/result')
  @HttpCode(HttpStatus.OK)
  async submitWhatDidYouHearResult(
    @CurrentUser() user: AuthUser,
    @Param() params: ReviewCardIdParamDto,
    @Query() query: ReviewDeckQueryDto,
    @Body() body: SubmitWhatDidYouHearResultDto,
  ) {
    const cardId = validateReviewCardId(params.cardId);
    const deckId = validateReviewDeckId(query.deckId);
    const wrongAttemptCount = validateWhatDidYouHearSubmitInput(body);
    const result = await this.reviews.submitWhatDidYouHearQuizResult(
      user.id,
      deckId,
      cardId,
      wrongAttemptCount,
      new Date(),
    );

    return serializeSubmitWhatDidYouHearResponse(result);
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
