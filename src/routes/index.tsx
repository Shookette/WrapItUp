import { createFileRoute } from "@tanstack/react-router";
import { getMyLists } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { useCallback } from "react";
import { Flex } from "@mantine/core";
import { FullList } from "../interfaces/List.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import ListTableComponent from "../components/ListTable.tsx";
import { IconPlus } from "@tabler/icons-react";
import PrivateLayout from "../components/PrivateLayout.tsx";
import Button from "../components/Button/Button.tsx";
import Page from "../components/Page/Page.tsx";
import Title from "../components/Title/Title.tsx";

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
      <Page size="lg">
        <Title>
          <Flex justify="space-between">
            Mes listes{" "}
            <Button
              icon={<IconPlus size={24} />}
              type="success"
              onClick={() => navigate({ to: "/new" })}
            >
              Ajouter
            </Button>
          </Flex>
        </Title>

        <ListTableComponent lists={lists} onRedirect={redirectTo} />
      </Page>
    </PrivateLayout>
  );
}
