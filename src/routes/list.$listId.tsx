import { createFileRoute } from "@tanstack/react-router";
import { getListByID } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { useMemo } from "react";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { useUserContext } from "../hooks/UserContext.tsx";

export const Route = createFileRoute("/list/$listId")({
  component: RouteComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});

function RouteComponent() {
  const list = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { user } = useUserContext();

  if (!list) {
    return navigate({ to: "/" });
  }

  const isCurrentUser = list.userUID === user?.uid;

  const cards = useMemo(
    () =>
      (list.presents ?? []).map((present) => (
        <Card shadow="sm" padding="lg" radius="md" withBorder key={present.id}>
          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500}>{present.title}</Text>
            <Badge
              color={
                isCurrentUser
                  ? "green"
                  : present.status === "reserved"
                    ? "red"
                    : "green"
              }
            >
              {isCurrentUser
                ? `C'est un secret`
                : present.status === "reserved"
                  ? "Réservé"
                  : "Disponible"}
            </Badge>
          </Group>

          <Text size="sm" c="dimmed">
            {present.description}
          </Text>

          {present.url && (
            <Anchor href={present.url} target="_blank">
              Lien du cadeau
            </Anchor>
          )}

          {!isCurrentUser && (
            <Button
              color={present.status === "reserved" ? "red" : "green"}
              fullWidth
              mt="md"
              radius="md"
            >
              {present.status === "reserved"
                ? "Supprimer la réservation"
                : "Réserver"}
            </Button>
          )}
        </Card>
      )),
    [list.presents],
  );

  return (
    <Container>
      <Title order={2}>{list.title}</Title>
      <SimpleGrid cols={3}>{cards}</SimpleGrid>
    </Container>
  );
}
