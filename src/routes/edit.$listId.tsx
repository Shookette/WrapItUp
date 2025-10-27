import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  deleteList,
  getListByID,
  setList,
} from "../repository/ListRepository.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useCallback, useState } from "react";
import { isAuthenticated } from "../utils/routeUtils.ts";
import {
  Button as MButton,
  Center,
  Container,
  Divider,
  Flex,
  Paper,
  Space,
  Title,
} from "@mantine/core";
import ListForm from "../components/ListEdit/ListForm.tsx";
import ListUserForm from "../components/ListEdit/ListUserForm.tsx";
import { IconExclamationCircle, IconGift, IconUser } from "@tabler/icons-react";
import PrivateLayout from "../components/PrivateLayout.tsx";
import { notifications } from "@mantine/notifications";
import Button from "../components/Button/Button.tsx";

export const Route = createFileRoute("/edit/$listId")({
  component: EditComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
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
  const list = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("presents");
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);

  if (!list || list.userUID !== user?.uid) {
    return navigate({ to: "/" });
  }

  const handleDeleteList = useCallback(async () => {
    await deleteList(list.id);
    return navigate({ to: "/" });
  }, [list]);

  const removeUser = async (userUID: string) => {
    setLoading(true);

    await setList({
      ...list,
      allowedUsers: list.allowedUsers.filter(
        (user) => user.userUID !== userUID,
      ),
    });
    router.invalidate();
    notifications.show({
      color: "green",
      position: "top-right",
      message: `L'utilisateurice a été supprimé•e`,
    });
    setLoading(false);
  };

  return (
    <PrivateLayout>
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
              <MButton
                color={tab.key === activeTab ? "blue" : "gray"}
                onClick={() => setActiveTab(tab.key)}
                mr={10}
                size="compact-md"
              >
                {tab.icon}
                {tab.label}
              </MButton>
            ))}
            <Divider mt={10} mb={20} />
            {
              {
                presents: <ListForm list={list} />,
                users: (
                  <ListUserForm
                    list={list}
                    handleOnRemove={removeUser}
                    loading={loading}
                  />
                ),
                danger: (
                  <div>
                    <Button type="danger" onClick={() => handleDeleteList()}>
                      Supprimer la liste
                    </Button>
                  </div>
                ),
              }[activeTab]
            }
          </Paper>
        </Center>
      </Container>
    </PrivateLayout>
  );
}
