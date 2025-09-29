import { createFileRoute } from "@tanstack/react-router";
import { getMyLists } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { FC, useCallback, useMemo } from "react";
import { Container, Paper, Table, Title } from "@mantine/core";
import { List } from "../interfaces/List.ts";
import { useUserContext } from "../hooks/UserContext.tsx";

type Props = {
  lists: Array<List>;
  onRedirect: (list: List) => void
}

const ListTableComponent: FC<Props> = ({ lists, onRedirect }) => {


  const rows = useMemo(
    () =>
      lists.map((list) => (
        <Table.Tr onClick={() => onRedirect(list)} key={list.id}>
          <Table.Td>{list.title}</Table.Td>
          <Table.Td>{list.createdAt}</Table.Td>
        </Table.Tr>
      )),
    [lists],
  );

  return (
    <Table stickyHeader highlightOnHover striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Nom de la liste</Table.Th>
          <Table.Th>Date de création de la liste</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}

export default ListTableComponent