import { createFileRoute } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { List } from "../interfaces/List.ts";
import {
  deleteList,
  getListByID,
  setList,
} from "../repository/ListRepository.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useCallback, useState } from "react";
import { isAuthenticated } from "../utils/routeUtils.ts";
import {
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Paper,
  SimpleGrid,
  Space,
  Title,
} from "@mantine/core";
import ListForm from "../components/ListForm.tsx";
import ListUserForm from "../components/ListUserForm.tsx";

export const Route = createFileRoute("/edit/$listId")({
  component: EditComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});

function EditComponent() {
  const list: List | null = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [tab, setTab] = useState("presents");
  const { user } = useUserContext();

  if (!list || list.userUID !== user?.uid) {
    return navigate({ to: "/" });
  }

  const handleOnSubmit: SubmitHandler<List> = useCallback(async (list) => {
    await setList(list);
    navigate({
      to: "/",
    });
  }, []);

  const handleDeleteList = useCallback(async () => {
    await deleteList(list.id);
    return navigate({ to: "/" });
  }, [list]);

  const { control, handleSubmit, watch } = useForm<List>({
    defaultValues: list,
  });


  return (
    <Container>
      <Center>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Flex justify="space-between">
            <Title order={2} mr={20}>Modifier votre liste de cadeau</Title>
            <Button color="red" onClick={() => handleDeleteList()}>
              Supprimer la liste
            </Button>
          </Flex>
          <Space h="md" />
          <Button onClick={() => setTab("presents")} mr={10} size="compact-md">Cadeaux</Button>
          <Button onClick={() => setTab("users")} size="compact-md">Utilisateurices</Button>
          <Divider mt={10} mb={20} />
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            {
              {
                presents: (
                  <ListForm control={control} watch={watch} />
                ),
                users: <ListUserForm control={control} watch={watch} />,
              }[tab]
            }
            <SimpleGrid>
              <Button type="submit">Envoyer</Button>
            </SimpleGrid>
          </form>
        </Paper>
      </Center>
    </Container >
  );
}
