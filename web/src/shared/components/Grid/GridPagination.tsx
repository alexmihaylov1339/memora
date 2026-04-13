interface GridPaginationProps {
  currentPage: number;
  totalPages: number;
  pages: number[];
  onPrev: () => void;
  onPage: (page: number) => void;
  onNext: () => void;
}

export default function GridPagination({
  currentPage,
  totalPages,
  pages,
  onPrev,
  onPage,
  onNext,
}: GridPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-8">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentPage === 1}
        className="flex h-[30px] w-[35px] items-center justify-center rounded-[5px] border border-[rgba(1,1,1,0.2)] bg-white text-base font-medium text-[rgba(1,1,1,0.5)] shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
      >
        &lt;
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPage(page)}
          className={[
            'flex h-[30px] w-[35px] items-center justify-center rounded-[5px] border text-base font-medium shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition',
            page === currentPage
              ? 'border-[#378ADD] bg-[#378ADD] text-white'
              : 'border-[rgba(1,1,1,0.2)] bg-white text-[rgba(1,1,1,0.5)]',
          ].join(' ')}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="flex h-[30px] w-[35px] items-center justify-center rounded-[5px] border border-[rgba(1,1,1,0.2)] bg-white text-base font-medium text-[rgba(1,1,1,0.5)] shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next page"
      >
        &gt;
      </button>
    </div>
  );
}
