import {
  REVIEW_KIND_UNSUPPORTED_REASONS,
  resolveReviewKindSupport,
} from './review-kind-adapter';

describe('review-kind-adapter', () => {
  it('marks basic cards with valid payloads as supported', () => {
    expect(
      resolveReviewKindSupport('basic', { front: 'spielen', back: 'to play' }),
    ).toEqual({
      isReviewSupported: true,
      reviewUnsupportedReason: null,
    });
  });

  it('marks basic cards with invalid payloads as unsupported', () => {
    expect(resolveReviewKindSupport('basic', { front: 'spielen' })).toEqual({
      isReviewSupported: false,
      reviewUnsupportedReason: REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
    });
  });

  it('marks cloze text cards with valid payloads as supported', () => {
    expect(
      resolveReviewKindSupport('cloze_text', {
        text: 'Ich {{c1::spiele}} gern Tennis.',
        answer: 'spiele',
      }),
    ).toEqual({
      isReviewSupported: true,
      reviewUnsupportedReason: null,
    });
  });

  it('marks cloze text cards with invalid payloads as unsupported', () => {
    expect(
      resolveReviewKindSupport('cloze_text', {
        text: 'Ich {{c1::spiele}} gern Tennis.',
        answer: 'lerne',
      }),
    ).toEqual({
      isReviewSupported: false,
      reviewUnsupportedReason: REVIEW_KIND_UNSUPPORTED_REASONS.invalidPayload,
    });
  });

  it('marks unknown kinds as unsupported for review', () => {
    expect(resolveReviewKindSupport('audio_gap', {})).toEqual({
      isReviewSupported: false,
      reviewUnsupportedReason:
        REVIEW_KIND_UNSUPPORTED_REASONS.kindNotReviewEnabled,
    });
  });
});
