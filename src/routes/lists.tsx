import { createFileRoute } from "@tanstack/react-router";
import { getLists } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { useCallback } from "react";
import { Container, Paper, Title } from "@mantine/core";
import { List } from "../interfaces/List.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import ListTableComponent from "../components/ListTable.tsx";
import PrivateLayout from "../components/PrivateLayout.tsx";

export const Route = createFileRoute("/lists")({
  component: ListsComponent,
  loader: getLists,
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function ListsComponent() {
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

  return (
    <PrivateLayout>
      <Container>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={2}>Listes de cadeaux</Title>
          <ListTableComponent
            lists={lists}
            showAuthor
            onRedirect={redirectTo}
          />
        </Paper>
      </Container>
    </PrivateLayout>
  );
}
