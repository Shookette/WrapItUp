import { createFileRoute } from "@tanstack/react-router";
import { getListByID, setList } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import { useCallback, useMemo, useState } from "react";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { useUserContext } from "../hooks/UserContext.tsx";
import { List } from "../interfaces/List.ts";

export const Route = createFileRoute("/list/$listId")({
  component: ViewComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});

function ViewComponent() {
  const list = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { user } = useUserContext();
  const [currentList, setCurrentList] = useState<List | null>(list);

  console.log("view");

  if (!currentList) {
    return navigate({ to: "/" });
  }

  const isCurrentUser = currentList.userUID === user?.uid;

  const bookGift = useCallback(async (presentId: string) => {
    const present = currentList.presents.find(
      (present) => present.id === presentId,
    );
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

          {!isCurrentUser &&
            (!present.reservedBy || present.reservedBy === user?.uid) && (
              <Button
                color={present.status === "reserved" ? "red" : "green"}
                fullWidth
                mt="md"
                radius="md"
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
    <Container>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2}>{currentList.title}</Title>
        <SimpleGrid cols={3}>{cards}</SimpleGrid>
      </Paper>
    </Container>
  );
}
