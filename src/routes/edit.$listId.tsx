import { createFileRoute } from "@tanstack/react-router";
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
  Space,
  Title,
} from "@mantine/core";
import ListForm from "../components/ListForm.tsx";
import ListUserForm from "../components/ListUserForm.tsx";
import { IconExclamationCircle, IconGift, IconUser } from "@tabler/icons-react";

export const Route = createFileRoute("/edit/$listId")({
  component: EditComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});

const tabs: Array<{ icon: React.ReactNode; key: string; label: string }> = [
  {
    icon: <IconGift size={20} />,
    key: "presents",
    label: "Cadeaux",
  },
  { icon: <IconUser size={20} />, key: "users", label: "Utilisateurices" },
  {
    icon: <IconExclamationCircle size={20} />,
    key: "danger",
    label: "Danger zone",
  },
];

function EditComponent() {
  const list: List | null = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [tab, setTab] = useState("presents");
  const { user } = useUserContext();

  if (!list || list.userUID !== user?.uid) {
    return navigate({ to: "/" });
  }

  const handleDeleteList = useCallback(async () => {
    await deleteList(list.id);
    return navigate({ to: "/" });
  }, [list]);

  const removeUser = async (userUID: string) => {
    list.allowedUsers = list.allowedUsers.filter(
      (user) => user.userUID !== userUID,
    );

    await setList(list);
  };

  return (
    <Container>
      <Center>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Flex justify="space-between">
            <Title order={2} mr={20}>
              Modifier votre liste de cadeau
            </Title>
          </Flex>
          <Space h="md" />

          {tabs.map((tab) => (
            <Button
              color="gray"
              onClick={() => setTab(tab.key)}
              mr={10}
              size="compact-md"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
          <Divider mt={10} mb={20} />
          {
            {
              presents: <ListForm list={list} />,
              users: <ListUserForm list={list} onRemove={removeUser} />,
              danger: (
                <div>
                  <Button color="red" onClick={() => handleDeleteList()}>
                    Supprimer la liste
                  </Button>
                </div>
              ),
            }[tab]
          }
        </Paper>
      </Center>
    </Container>
  );
}
