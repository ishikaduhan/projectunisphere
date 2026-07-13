import type { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
}

const FilterBar = ({ children }: FilterBarProps) => <div className="filter-row">{children}</div>;

export default FilterBar;
