import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { FullList } from "../interfaces/List.ts";
import { v4 as uuidv4 } from "uuid";
import { setList } from "../repository/ListRepository.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { isAuthenticated } from "../utils/routeUtils.ts";
import {
  Center,
  Container,
  Paper,
  SimpleGrid,
  Space,
  Title,
} from "@mantine/core";
import PrivateLayout from "../components/PrivateLayout.tsx";
import Button from "../components/Button/Button.tsx";
import Input from "../components/Input/Input.tsx";

export const Route = createFileRoute("/new")({
  component: NewComponent,
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function NewComponent() {
  const { navigate } = useRouter();
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);

  const defaultList: FullList = {
    id: uuidv4(),
    userUID: user!.uid,
    createdAt: dayjs().format("YYYY-MM-DD"),
    title: "",
    presents: [],
    allowedUsers: [],
  };

  const { control, handleSubmit } = useForm<FullList>({
    defaultValues: defaultList,
  });

  const handleOnSubmit: SubmitHandler<FullList> = useCallback(async (list) => {
    setLoading(true);
    await setList(list);
    setLoading(false);
    navigate({
      to: `/edit/${list.id}`,
    });
  }, []);

  return (
    <PrivateLayout>
      <Container>
        <Center>
          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <Title order={2}>Ajouter une nouvelle liste de cadeau</Title>
            <Space h="md" />
            <form onSubmit={handleSubmit(handleOnSubmit)}>
              <Controller
                name="title"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <Input
                    id="title"
                    label="Nom de la liste"
                    name={name}
                    placeholder="Nom de la liste"
                    required
                    value={value}
                    onChange={onChange}
                  />
                )}
              />

              <Space h="md" />
              <SimpleGrid>
                <Button isSubmit loading={loading} type="primary">
                  Envoyer
                </Button>
              </SimpleGrid>
            </form>
          </Paper>
        </Center>
      </Container>
    </PrivateLayout>
  );
}
