import { createFileRoute } from "@tanstack/react-router";
import { getLists } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { useCallback, useMemo } from "react";
import { Container, Paper, Table, Title } from "@mantine/core";
import { List } from "../interfaces/List.ts";
import { useUserContext } from "../hooks/UserContext.tsx";

export const Route = createFileRoute("/")({
  component: IndexComponent,
  loader: () => getLists(),
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});

function IndexComponent() {
  const lists = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { user } = useUserContext();

  const redirectTo = useCallback(
    (list: List) => {
      if (list.userUID === user?.uid) {
        return navigate({
          to: "/edit/$listId",
          params: { listId: list.id },
        });
      }

      return navigate({ to: "/list/$listId", params: { listId: list.id } });
    },
    [navigate],
  );

  const rows = useMemo(
    () =>
      lists.map((list) => (
        <Table.Tr onClick={() => redirectTo(list)} key={list.id}>
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
