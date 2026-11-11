import "./list.css";

import { createFileRoute, Navigate } from "@tanstack/react-router";
import { getListByID, setList } from "#repository/ListRepository.ts";
import { isAuthenticated } from "#utils/routeUtils.ts";
import { isHttpUrl } from "#utils/url.ts";
import { useState } from "react";
import { useUserContext } from "#hooks/UserContext.tsx";
import { FullList } from "#interfaces/List.ts";
import PrivateLayout from "#components/PrivateLayout.tsx";
import Badge from "#components/Badge/Badge.tsx";
import Button from "#components/Button/Button.tsx";
import Card from "#components/Card/Card.tsx";
import Page from "#components/Page/Page.tsx";
import Title from "#components/Title/Title.tsx";
import Grid from "#components/Grid/Grid.tsx";

export const Route = createFileRoute("/list/$listId")({
  component: ViewComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function ViewComponent() {
  const list = Route.useLoaderData();
  const { user } = useUserContext();
  const [currentList, setCurrentList] = useState<FullList | null>(list);

  if (
    !currentList ||
    !currentList.allowedUsers.find(({ userUID }) => userUID === user?.uid)
  ) {
    return <Navigate to="/" />;
  }

  const isCurrentUser = currentList.userUID === user?.uid;

  const bookGift = async (presentId: string) => {
    const present = currentList.presents.find(({ id }) => id === presentId);
    if (present) {
      const isBooked = present.status === "reserved";

      present.status = isBooked ? "available" : "reserved";
      present.reservedBy = isBooked ? "" : user?.uid;

      await setList(currentList);

      setCurrentList(await getListByID(currentList.id));
    }
  };

  const cards = (currentList.presents ?? []).map((present) => (
    <Card key={present.id}>
      <div className="present__header">
        <span className="present__title">{present.title}</span>
        <Badge
          type={
            isCurrentUser
              ? "success"
              : present.status === "reserved"
                ? "danger"
                : "success"
          }
        >
          {isCurrentUser
            ? `C'est un secret`
            : present.status === "reserved"
              ? "Réservé"
              : "Disponible"}
        </Badge>
      </div>

      {present.description && (
        <p className="present__description">{present.description}</p>
      )}

      {isHttpUrl(present.url) && (
        <a href={present.url} rel="noopener noreferrer" target="_blank">
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
  ));

  return (
    <PrivateLayout>
      <Page size="lg">
        <Title>{currentList.title}</Title>
        <Grid>{cards}</Grid>
      </Page>
    </PrivateLayout>
  );
}
