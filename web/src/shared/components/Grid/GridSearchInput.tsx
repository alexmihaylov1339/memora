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
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
}
