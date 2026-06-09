import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import {
  parsePracticeResponse,
  parseReviewQueueResponse,
  parseWhatDidYouHearRoundResponse,
} from './reviewResponseParsers';
import type {
  GradeReviewDto,
  GradeReviewResponse,
  ReviewCardIdParams,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = ManageService(API_URL);

const REVIEW_ENDPOINTS = {
  PRACTICE: '/v1/reviews/practice',
  QUEUE: '/v1/reviews/queue',
  GRADE: (cardId: string) => `/v1/reviews/${cardId}/grade`,
  WHAT_DID_YOU_HEAR: '/v1/reviews/what-did-you-hear',
} as const;

export {
  parsePracticeResponse,
  parseReviewQueueResponse,
  parseWhatDidYouHearRoundResponse,
};

export const reviewService = {
  async getQueue(deckId: string) {
    const result = await api
      .prepareRequest(REVIEW_ENDPOINTS.QUEUE, HTTP_METHODS.GET)
      .setQueryParams({ deckId })
      .setHeaders(getAuthHeaders())
      .execRequest<unknown>();

    return parseReviewQueueResponse(result);
  },

  async getPractice(deckId: string) {
    const result = await api
      .prepareRequest(REVIEW_ENDPOINTS.PRACTICE, HTTP_METHODS.GET)
      .setQueryParams({ deckId })
      .setHeaders(getAuthHeaders())
      .execRequest<unknown>();

    return parsePracticeResponse(result);
  },

  grade(params: ReviewCardIdParams & GradeReviewDto) {
    const { cardId, deckId, grade } = params;

    return api
      .prepareRequest(REVIEW_ENDPOINTS.GRADE(cardId), HTTP_METHODS.POST)
      .setQueryParams({ deckId })
      .setHeaders(getAuthHeaders())
      .setBody({ grade })
      .execRequest<GradeReviewResponse>();
  },

  async getWhatDidYouHearRound(deckId: string) {
    const result = await api
      .prepareRequest(REVIEW_ENDPOINTS.WHAT_DID_YOU_HEAR, HTTP_METHODS.GET)
      .setQueryParams({ deckId })
      .setHeaders(getAuthHeaders())
      .execRequest<unknown>();

    return parseWhatDidYouHearRoundResponse(result);
  },

};
