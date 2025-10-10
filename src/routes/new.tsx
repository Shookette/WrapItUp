import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { List } from "../interfaces/List.ts";
import { v4 as uuidv4 } from "uuid";
import { setList } from "../repository/ListRepository.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import dayjs from "dayjs";
import { useCallback } from "react";
import { isAuthenticated } from "../utils/routeUtils.ts";
import {
  Button,
  Center,
  Container,
  Paper,
  SimpleGrid,
  Space,
  TextInput,
  Title,
} from "@mantine/core";

export const Route = createFileRoute("/new")({
  component: NewComponent,
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});

function NewComponent() {
  const { navigate } = useRouter();
  const { user } = useUserContext();

  const defaultList: List = {
    id: uuidv4(),
    userUID: user!.uid,
    createdAt: dayjs().format("YYYY-MM-DD"),
    title: "",
    presents: [],
    allowedUsers: [],
  };

  const { control, handleSubmit } = useForm<List>({
    defaultValues: defaultList,
  });

  const handleOnSubmit: SubmitHandler<List> = useCallback(async (list) => {
    await setList(list);
    navigate({
      to: `/edit/${list.id}`,
    });
  }, []);

  return (
    <Container>
      <Center>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={2}>Ajouter une nouvelle Liste de cadeau</Title>
          <Space h="md" />
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <Controller
              name="title"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <TextInput
                  id="title"
                  name={name}
                  value={value}
                  onChange={onChange}
                  label="Nom de la liste de cadeau"
                  autoFocus
                  withAsterisk
                  required
                />
              )}
            />

            <Space h="md" />
            <SimpleGrid>
              <Button type="submit">Envoyer</Button>
            </SimpleGrid>
          </form>
        </Paper>
      </Center>
    </Container>
  );
}
