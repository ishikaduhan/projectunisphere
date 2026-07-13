import type { FormEvent } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  buttonLabel?: string;
}

const SearchBar = ({ value, onChange, onSubmit, placeholder = 'Search...', buttonLabel = 'Search' }: SearchBarProps) => (
  <form className="search-bar" onSubmit={onSubmit}>
    <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    <button type="submit" className="button button-secondary">
      {buttonLabel}
    </button>
  </form>
);

export default SearchBar;
