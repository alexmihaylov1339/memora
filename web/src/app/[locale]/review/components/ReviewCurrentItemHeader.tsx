import type { ReviewQueueItem } from '@features/reviews';

const USER_VISIBLE_POSITION_OFFSET = 1;

interface ReviewCurrentItemHeaderProps {
  item: ReviewQueueItem;
  queueCount: number;
}

export default function ReviewCurrentItemHeader({
  item,
  queueCount,
}: ReviewCurrentItemHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Chunk</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          {item.chunkTitle}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Card {item.positionInChunk + USER_VISIBLE_POSITION_OFFSET} in chunk • queue size{' '}
          {queueCount}
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 px-4 py-3 text-right">
        <p className="text-xs uppercase tracking-wide text-slate-500">Current streak</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {item.consecutiveSuccessCount}
        </p>
      </div>
    </div>
  );
}
