import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import type {
  GradeReviewDto,
  GradeReviewResponse,
  ReviewCardIdParams,
  ReviewQueueResponse,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

const REVIEW_ENDPOINTS = {
  QUEUE: '/v1/reviews/queue',
  GRADE: (cardId: string) => `/v1/reviews/${cardId}/grade`,
} as const;

export const reviewService = {
  getQueue() {

    return api
      .prepareRequest(REVIEW_ENDPOINTS.QUEUE, HTTP_METHODS.GET)
      .setHeaders(getAuthHeaders())
      .execRequest<ReviewQueueResponse>();
  },

  grade(params: ReviewCardIdParams & GradeReviewDto) {
    const { cardId, grade } = params;

    return api
      .prepareRequest(REVIEW_ENDPOINTS.GRADE(cardId), HTTP_METHODS.POST)
      .setHeaders(getAuthHeaders())
      .setBody({ grade })
      .execRequest<GradeReviewResponse>();
  },
};
