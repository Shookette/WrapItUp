import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { List } from "../interfaces/List.ts";
import { v4 as uuidv4 } from "uuid";
import { setList } from "../repository/ListRepository.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import dayjs from "dayjs";
import { useCallback } from "react";
import { setPresent } from "../repository/PresentRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";
import {
  ActionIcon,
  Button,
  Center,
  Container,
  Paper,
  SimpleGrid,
  Space,
  Table,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

const ListNew = () => {
  const { navigate } = useRouter();
  const { user } = useUserContext();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<List>({
    defaultValues: {
      id: uuidv4(),
      userUID: user!.uid,
      createdAt: dayjs().format("YYYY-MM-DD"),
    },
  });

  const watchListId = watch("id");

  const { fields, append, remove } = useFieldArray({
    name: "presents",
    control,
  });

  const handleOnSubmit: SubmitHandler<List> = useCallback(async (list) => {
    await setList(list);
    await Promise.all(
      list.presents.map(async (present) => {
        await setPresent(present);
      }),
    );
    navigate({
      to: "/",
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
                  error={errors.title && "Le nom de la liste est obligatoire"}
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
                    <Table.Tr>
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
                              error={
                                errors.title &&
                                "Le nom du cadeau est obligatoire"
                              }
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
                              autoFocus
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
                              autoFocus
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
};

export const Route = createFileRoute("/list-new")({
  component: ListNew,
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});
