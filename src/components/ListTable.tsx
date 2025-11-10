import { FC, useMemo } from "react";
import { ActionIcon, Table, Text } from "@mantine/core";
import { FullList } from "../interfaces/List.ts";
import { IconTrash } from "@tabler/icons-react";

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
}) => {
  const rows = useMemo(
    () =>
      lists.map((list) => (
        <Table.Tr key={list.id}>
          <Table.Td onClick={() => onRedirect(list)}>{list.title}</Table.Td>
          <Table.Td onClick={() => onRedirect(list)}>{list.createdAt}</Table.Td>
          {showAuthor && (
            <Table.Td onClick={() => onRedirect(list)}>
              {list.username ?? "-"}
            </Table.Td>
          )}
          {showAuthor && (
            <Table.Td>
              <ActionIcon
                loading={loading}
                variant="filled"
                aria-label="Supprimer"
                color="red"
                onClick={() => onRemoveAddedList?.(list)}
              >
                <IconTrash
                  style={{ width: "70%", height: "70%" }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Table.Td>
          )}
        </Table.Tr>
      )),
    [lists],
  );

  return (
    <Table stickyHeader highlightOnHover striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Nom</Table.Th>
          <Table.Th>Date de création</Table.Th>
          {showAuthor && <Table.Th>Auteur</Table.Th>}
          {showAuthor && <Table.Th>Action</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.length > 0 ? (
          rows
        ) : (
          <Table.Tr>
            <Table.Td colSpan={showAuthor ? 4 : 2}>
              <Text ta="center">Aucune liste</Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
};

export default ListTableComponent;
