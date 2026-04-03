import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ReviewsService } from './reviews.service';
import type { GradeReviewDto } from './dto/grade-review.dto';
import { serializeGradeReviewResponse } from './dto/grade-review-response.dto';
import { serializeReviewQueueResponse } from './dto/review-queue-response.dto';
import type { ReviewCardIdParamDto } from './dto/review-card-id-param.dto';
import {
  validateGradeReviewInput,
  validateReviewCardId,
} from './dto/review-validation';

@Controller('reviews')
@UseGuards(AuthGuard)
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('queue')
  async queue() {
    const items = await this.reviews.getEligibleQueueItems();

    return serializeReviewQueueResponse(items);
  }

  @Post(':cardId/grade')
  @HttpCode(HttpStatus.OK)
  async grade(
    @Param() params: ReviewCardIdParamDto,
    @Body() body: GradeReviewDto,
  ) {
    const cardId = validateReviewCardId(params.cardId);
    const grade = validateGradeReviewInput(body);
    const result = await this.reviews.gradeReview(cardId, grade);

    return serializeGradeReviewResponse(result);
  }
}
