import { createFileRoute } from "@tanstack/react-router";
import { getListByID, setList } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { useCallback, useMemo, useState } from "react";
import { useUserContext } from "../hooks/UserContext.tsx";
import { FullList } from "../interfaces/List.ts";
import PrivateLayout from "../components/PrivateLayout.tsx";
import Button from "../components/Button/Button.tsx";
import Page from "../components/Page/Page.tsx";
import Title from "../components/Title/Title.tsx";
import Grid from "../components/Grid/Grid.tsx";
import Card from "../components/Card/Card.tsx";

export const Route = createFileRoute("/list/$listId")({
  component: ViewComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function ViewComponent() {
  const list = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { user } = useUserContext();
  const [currentList, setCurrentList] = useState<FullList | null>(list);

  if (
    !currentList ||
    !currentList.allowedUsers.find(({ userUID }) => userUID === user?.uid)
  ) {
    return navigate({ to: "/" });
  }

  const isCurrentUser = currentList.userUID === user?.uid;

  const bookGift = useCallback(async (presentId: string) => {
    const present = currentList.presents.find(({ id }) => id === presentId);
    if (present) {
      const isBooked = present.status === "reserved";

      present.status = isBooked ? "available" : "reserved";
      present.reservedBy = isBooked ? "" : user?.uid;

      await setList(currentList);

      setCurrentList(await getListByID(currentList.id));
    }
  }, []);

  const cards = useMemo(
    () =>
      (currentList.presents ?? []).map((present) => (
        <Card>
          <p>{present.title}</p>
          <p>
            {present.description}
          </p>
          {present.url && (
            <a href={present.url} target="_blank">
              Lien du cadeau
            </a>
          )}

          {!isCurrentUser &&
            (!present.reservedBy || present.reservedBy === user?.uid) && (
              <Button
                type={present.status === "reserved" ? "danger" : "success"}
                onClick={() => bookGift(present.id)}
              >
                {present.status === "reserved"
                  ? "Supprimer la réservation"
                  : "Réserver"}
              </Button>
            )}
        </Card>
      )),
    [currentList.presents],
  );

  return (
    <PrivateLayout>
      <Page size='lg'>
        <Title>{currentList.title}</Title>
        <Grid>{cards}</Grid>
      </Page>
    </PrivateLayout>
  );
}
