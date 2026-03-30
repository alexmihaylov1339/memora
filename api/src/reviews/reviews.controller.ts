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
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  queue() {
    return this.reviews.getQueueStub();
  }

  @Post(':cardId/grade')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  grade(@Param() params: ReviewCardIdParamDto, @Body() body: GradeReviewDto) {
    const cardId = validateReviewCardId(params.cardId);
    validateGradeReviewInput(body);
    return this.reviews.gradeStub(cardId, body);
  }
}
