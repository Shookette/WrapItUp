import { createFileRoute } from "@tanstack/react-router";
import { getLists } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { useCallback, useMemo } from "react";
import { Container, Paper, Table, Title } from "@mantine/core";

export const Route = createFileRoute("/")({
  component: Index,
  loader: () => getLists(),
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});

function Index() {
  const lists = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const redirectTo = useCallback(
    (listUID: string) =>
      navigate({ to: "/list/$listId", params: { listId: listUID } }),
    [navigate],
  );

  const rows = useMemo(
    () =>
      lists.map((list) => (
        <Table.Tr onClick={() => redirectTo(list.id)} key={list.id}>
          <Table.Td>{list.title}</Table.Td>
          <Table.Td>{list.username}</Table.Td>
          <Table.Td>{list.createdAt}</Table.Td>
        </Table.Tr>
      )),
    [lists],
  );

  return (
    <Container>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2}>Liste de cadeaux des utilisateurs</Title>
        <Table stickyHeader highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nom de la liste</Table.Th>
              <Table.Th>Créateur de la liste</Table.Th>
              <Table.Th>Date de création de la liste</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}
