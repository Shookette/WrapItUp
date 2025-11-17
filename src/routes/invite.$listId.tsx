import { createFileRoute, useRouter } from "@tanstack/react-router";
import PrivateLayout from "../components/PrivateLayout.tsx";
import { getListByID, setList } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { FullList } from "../interfaces/List.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useEffect, useState } from "react";
import Button from "../components/Button/Button.tsx";
import Page from "../components/Page/Page.tsx";

export const Route = createFileRoute("/invite/$listId")({
  component: InviteComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function InviteComponent() {
  const list: FullList | null = Route.useLoaderData();
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);
  const navigate = Route.useNavigate();
  const router = useRouter();

  async function joinList() {
    if (!user || !list) {
      return;
    }

    setLoading(true);
    const newUser = {
      userUID: user.uid,
      username: user.displayName ?? "",
    };

    await setList({
      ...list,
      allowedUsers: list.allowedUsers
        ? [...list.allowedUsers, newUser]
        : [newUser],
    });
    router.invalidate();

    setLoading(false);
  }

  useEffect(() => {
    if (
      list &&
      (list.allowedUsers.find(
        (allowedUser) => allowedUser.userUID === user?.uid,
      ) !== undefined || list.userUID === user?.uid)
    ) {
      navigate({ to: "/list/$listId" });
    }
  }, [list]);

  return (
    <PrivateLayout>
      <Page size="md">
        {!list ? (
          <p>Liste introuvable</p>
        ) : (
          [
            <p>
              Vous avez reçu une invitation pour rejoindre la liste{" "}
              <strong>{list?.title}</strong> de{" "}
              <strong>{list?.username}</strong>
            </p>,

            <Button loading={loading} onClick={joinList}>
              Rejoindre la liste
            </Button>,
          ]
        )}
      </Page>
    </PrivateLayout>
  );
}
