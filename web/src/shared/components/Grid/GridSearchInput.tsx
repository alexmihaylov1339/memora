interface GridSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function GridSearchInput({
  value,
  onChange,
  placeholder = 'Search grid rows',
}: GridSearchInputProps) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[rgba(1,1,1,0.38)]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-[8px] border border-[#e5e7eb] bg-white pl-9 pr-3 text-sm text-[rgba(1,1,1,0.72)] placeholder:text-[rgba(1,1,1,0.38)] outline-none transition focus:border-[#1d6fa5] focus:ring-1 focus:ring-[#1d6fa5]"
      />
    </div>
  );
}
