import "./Table.css";

import { Children, FC, PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";

type TableProps = PropsWithChildren<{
  emptyMessage?: string;
  headers: ReactNode[];
  highlightOnHover?: boolean;
  striped?: boolean;
}>;

const Table: FC<TableProps> = ({
  children,
  emptyMessage = "Aucun élément",
  headers,
  highlightOnHover = false,
  striped = false,
}) => {
  const isEmpty = Children.toArray(children).length === 0;

  return (
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
};

export default Table;
