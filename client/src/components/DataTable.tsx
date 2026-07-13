import type { ReactNode } from 'react';

interface DataTableProps {
  headers: string[];
  children: ReactNode;
}

const DataTable = ({ headers, children }: DataTableProps) => (
  <div className="table-container">
    <table className="data-table">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export default DataTable;
