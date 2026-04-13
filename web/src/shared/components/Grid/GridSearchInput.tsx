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
    <div className="relative w-full max-w-[602px]">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[rgba(1,1,1,0.2)]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
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
        className="h-[45px] w-full rounded-[5px] border border-[rgba(1,1,1,0.2)] bg-white pl-10 pr-3 text-[18px] text-[rgba(1,1,1,0.72)] placeholder:text-[rgba(1,1,1,0.2)] outline-none transition focus:border-[#378ADD] focus:ring-1 focus:ring-[#378ADD]"
      />
    </div>
  );
}
