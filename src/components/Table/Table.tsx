import "./Table.css";

import { FC, PropsWithChildren, ReactNode } from "react";

type TableProps = PropsWithChildren<{
  emptyMessage?: string;
  headers: ReactNode[];
  isEmpty?: boolean;
}>;

/**
 * Tableau simple. Les lignes sont passées en `children`
 * (`<tr className="table__row"><td className="table__cell">`).
 */
const Table: FC<TableProps> = ({
  children,
  emptyMessage = "Aucun élément",
  headers,
  isEmpty = false,
}) => (
  <div className="table">
    <table className="table__table">
      <thead>
        <tr className="table__row">
          {headers.map((header, index) => (
            <th className="table__header" key={index}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isEmpty ? (
          <tr className="table__row">
            <td
              className="table__cell table__cell--empty"
              colSpan={headers.length}
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          children
        )}
      </tbody>
    </table>
  </div>
);

export default Table;
