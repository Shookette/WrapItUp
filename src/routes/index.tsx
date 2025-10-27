import { createFileRoute } from "@tanstack/react-router";
import { getMyLists } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { useCallback } from "react";
import { Button, Container, Flex, Paper, Title } from "@mantine/core";
import { FullList } from "../interfaces/List.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import ListTableComponent from "../components/ListTable.tsx";
import { IconPlus } from "@tabler/icons-react";
import PrivateLayout from "../components/PrivateLayout.tsx";

export const Route = createFileRoute("/")({
  component: IndexComponent,
  loader: ({ context }) => {
    const user = context.auth?.user;

    if (!user) {
      return [];
    }

    return getMyLists(user?.uid);
  },
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function IndexComponent() {
  const lists = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { user } = useUserContext();

  const redirectTo = useCallback(
    (list: FullList) => {
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
          <Title order={2}>
            <Flex>
              Mes listes{" "}
              <Button
                color="green"
                style={{ marginLeft: "auto", display: "block" }}
                onClick={() => navigate({ to: "/new" })}
              >
                <IconPlus size={24} />
                Ajouter
              </Button>
            </Flex>
          </Title>

          <ListTableComponent lists={lists} onRedirect={redirectTo} />
        </Paper>
      </Container>
    </PrivateLayout>
  );
}
