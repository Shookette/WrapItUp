import { FC } from "react";
import { IconTrash } from "@tabler/icons-react";
import { FullList } from "#interfaces/List.ts";
import Button from "./Button/Button.tsx";
import Table from "./Table/Table.tsx";

type Props = {
  lists: Array<FullList>;
  loading?: boolean;
  showAuthor?: boolean;
  onRedirect: (list: FullList) => void;
  onRemoveAddedList?: (list: FullList) => void;
};

const ListTableComponent: FC<Props> = ({
  lists,
  loading = false,
  showAuthor = false,
  onRedirect,
  onRemoveAddedList,
}) => (
  <Table
    emptyMessage="Aucune liste"
    headers={
      showAuthor
        ? ["Nom", "Date de création", "Auteur", "Action"]
        : ["Nom", "Date de création"]
    }
    highlightOnHover
    striped
  >
    {lists.map((list) => (
      <tr className="table__row" key={list.id}>
        <td
          className="table__cell table__cell--clickable"
          onClick={() => onRedirect(list)}
        >
          {list.title}
        </td>
        <td
          className="table__cell table__cell--clickable"
          onClick={() => onRedirect(list)}
        >
          {list.createdAt}
        </td>
        {showAuthor && (
          <td
            className="table__cell table__cell--clickable"
            onClick={() => onRedirect(list)}
          >
            {list.username ?? "-"}
          </td>
        )}
        {showAuthor && (
          <td className="table__cell">
            <Button
              ariaLabel="Supprimer"
              icon={<IconTrash size={16} stroke={1.5} />}
              loading={loading}
              size="small"
              type="danger"
              onClick={() => onRemoveAddedList?.(list)}
            />
          </td>
        )}
      </tr>
    ))}
  </Table>
);

export default ListTableComponent;
