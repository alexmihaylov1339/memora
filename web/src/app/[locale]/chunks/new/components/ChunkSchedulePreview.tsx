import {
  CHUNK_MASTERY_TARGET,
  CHUNK_REVIEW_PREVIEW_HOURS,
  formatChunkScheduleInterval,
} from '@features/chunks';

export default function ChunkSchedulePreview() {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] p-5">
      <h2 className="text-lg font-semibold text-slate-900">Review Preview</h2>
      <p className="mt-1 text-sm text-slate-600">
        Chunks progress one card at a time. A mistake resets progress, and mastery currently
        requires {CHUNK_MASTERY_TARGET} consecutive successful reviews.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CHUNK_REVIEW_PREVIEW_HOURS.slice(0, 8).map((hours) => (
          <span
            key={hours}
            className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-700"
          >
            {formatChunkScheduleInterval(hours)}
          </span>
        ))}
        <span className="rounded-full border border-dashed border-sky-200 bg-white px-3 py-1 text-xs text-sky-700">
          +{CHUNK_REVIEW_PREVIEW_HOURS.length - 8} later steps
        </span>
      </div>
    </section>
  );
}
