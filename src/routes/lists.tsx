import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getLists, setList } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { useCallback, useState } from "react";
import { FullList } from "../interfaces/List.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import ListTableComponent from "../components/ListTable.tsx";
import PrivateLayout from "../components/PrivateLayout.tsx";
import Page from "../components/Page/Page.tsx";
import Title from "../components/Title/Title.tsx";

export const Route = createFileRoute("/lists")({
  component: ListsComponent,
  loader: ({ context }) => {
    const user = context.auth?.user;

    if (!user) {
      return [];
    }

    return getLists(user?.uid);
  },
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function ListsComponent() {
  const lists = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { user } = useUserContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  const removeAddedList = useCallback(async (removedList: FullList) => {
    setLoading(true);
    removedList.allowedUsers = removedList.allowedUsers.filter(
      (allowedUser) => allowedUser.userUID !== user?.uid,
    );
    await setList(removedList);
    router.invalidate();
    setLoading(false);
  }, []);

  return (
    <PrivateLayout>
      <Page size="lg">
        <Title>Listes de cadeaux</Title>
        <ListTableComponent
          lists={lists}
          loading={loading}
          showAuthor
          onRedirect={redirectTo}
          onRemoveAddedList={removeAddedList}
        />
      </Page>
    </PrivateLayout>
  );
}
