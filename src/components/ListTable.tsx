import { FC, useMemo } from "react";
import { Table } from "@mantine/core";
import { FullList } from "../interfaces/List.ts";

type Props = {
  lists: Array<FullList>;
  showAuthor?: boolean;
  onRedirect: (list: FullList) => void
}

const ListTableComponent: FC<Props> = ({ lists, showAuthor = false, onRedirect }) => {


  const rows = useMemo(
    () =>
      lists.map((list) => (
        <Table.Tr onClick={() => onRedirect(list)} key={list.id}>
          <Table.Td>{list.title}</Table.Td>
          <Table.Td>{list.createdAt}</Table.Td>
          {showAuthor && <Table.Td>{list.username ?? '-'}</Table.Td>}
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
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}

export default ListTableComponent