const FEEDBACK_TONES = {
  correct: { frequency: 660, durationMs: 140 },
  wrong: { frequency: 220, durationMs: 120 },
} as const;

type FeedbackTone = keyof typeof FEEDBACK_TONES;

export function playWhatDidYouHearFeedback(tone: FeedbackTone): void {
  if (typeof window === 'undefined') {
    return;
  }

  const AudioContextConstructor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextConstructor) {
    return;
  }

  const audioContext = new AudioContextConstructor();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const toneConfig = FEEDBACK_TONES[tone];

  oscillator.type = 'sine';
  oscillator.frequency.value = toneConfig.frequency;
  gain.gain.value = 0.08;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + toneConfig.durationMs / 1000);
  oscillator.addEventListener('ended', () => {
    void audioContext.close();
  });
}
