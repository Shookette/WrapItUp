import { createFileRoute } from "@tanstack/react-router";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { List } from "../interfaces/List.ts";
import { v4 as uuidv4 } from "uuid";
import {
  deleteList,
  getListByID,
  setList,
} from "../repository/ListRepository.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useCallback } from "react";
import { isAuthenticated } from "../utils/routeUtils.ts";
import {
  ActionIcon,
  Button,
  Center,
  Container,
  Flex,
  Paper,
  SimpleGrid,
  Space,
  Table,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

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
  const { user } = useUserContext();

  if (!list || list.userUID !== user?.uid) {
    return navigate({ to: "/" });
  }

  const { control, handleSubmit, watch } = useForm<List>({
    defaultValues: list,
  });

  const watchListId = watch("id");

  const { fields, append, remove } = useFieldArray({
    name: "presents",
    control,
  });

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

  return (
    <Container>
      <Center>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Flex justify="space-between">
            <Title order={2}>Ajouter une nouvelle Liste de cadeau</Title>
            <Button color="red" onClick={() => handleDeleteList()}>
              Supprimer la liste
            </Button>
          </Flex>
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
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nom du cadeau</Table.Th>
                  <Table.Th>Description du cadeau</Table.Th>
                  <Table.Th>Lien du cadeau</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {fields.map((_, index) => {
                  return (
                    <Table.Tr key={index}>
                      <Table.Td>
                        <Controller
                          name={`presents.${index}.title`}
                          control={control}
                          render={({ field: { onChange, value, name } }) => (
                            <TextInput
                              id="title"
                              name={name}
                              value={value}
                              onChange={onChange}
                              autoFocus
                              withAsterisk
                              required
                            />
                          )}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Controller
                          name={`presents.${index}.description`}
                          control={control}
                          render={({ field: { onChange, value, name } }) => (
                            <Textarea
                              id="description"
                              name={name}
                              value={value}
                              onChange={onChange}
                            />
                          )}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Controller
                          name={`presents.${index}.url`}
                          control={control}
                          render={({ field: { onChange, value, name } }) => (
                            <TextInput
                              id="url"
                              name={name}
                              value={value}
                              onChange={onChange}
                            />
                          )}
                        />
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon
                          variant="filled"
                          aria-label="Supprimer"
                          color="red"
                          onClick={() => remove(index)}
                        >
                          <IconTrash
                            style={{ width: "70%", height: "70%" }}
                            stroke={1.5}
                          />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
            <Space h="md" />
            <Button
              type="button"
              color="green"
              onClick={() =>
                append({
                  id: uuidv4(),
                  title: "",
                  status: "available",
                  listUID: watchListId,
                  description: "",
                  url: "",
                })
              }
            >
              Ajouter un cadeau
            </Button>
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
