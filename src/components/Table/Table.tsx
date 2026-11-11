import "./Table.css";

import { FC, PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";

type TableProps = PropsWithChildren<{
  emptyMessage?: string;
  headers: ReactNode[];
  /** Surligne la ligne survolée. */
  highlightOnHover?: boolean;
  isEmpty?: boolean;
  /** Lignes alternées grisées. */
  striped?: boolean;
}>;

/**
 * Tableau simple. Les lignes sont passées en `children`
 * (`<tr className="table__row"><td className="table__cell">`).
 * Cellule cliquable : ajouter `table__cell--clickable`.
 */
const Table: FC<TableProps> = ({
  children,
  emptyMessage = "Aucun élément",
  headers,
  highlightOnHover = false,
  isEmpty = false,
  striped = false,
}) => (
  <div
    className={classNames("table", {
      "table--hoverable": highlightOnHover,
      "table--striped": striped,
    })}
  >
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
