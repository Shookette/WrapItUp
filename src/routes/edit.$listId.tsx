import { useCallback, useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { Flex, Space } from "@mantine/core";
import { IconExclamationCircle, IconGift, IconUser } from "@tabler/icons-react";

import {
  deleteList,
  getListByID,
  setList,
} from "../repository/ListRepository.ts";
import { useUserContext } from "../hooks/UserContext.tsx";
import { isAuthenticated } from "../utils/routeUtils.ts";

import ListForm from "../components/ListEdit/ListForm.tsx";
import ListUserForm from "../components/ListEdit/ListUserForm.tsx";
import PrivateLayout from "../components/PrivateLayout.tsx";
import Button from "../components/Button/Button.tsx";
import Tabs from "../components/Tabs/Tabs.tsx";
import Page from "../components/Page/Page.tsx";
import Title from "../components/Title/Title.tsx";

export const Route = createFileRoute("/edit/$listId")({
  component: EditComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function EditComponent() {
  const list = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const router = useRouter();

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

  const tabs = useMemo(
    () =>
      list
        ? [
          {
            children: <ListForm list={list} />,
            icon: <IconGift size={20} />,
            key: "presents",
            title: "Cadeaux",
          },
          {
            children: (
              <ListUserForm
                list={list}
                handleOnRemove={removeUser}
                loading={loading}
              />
            ),
            icon: <IconUser size={20} />,
            key: "users",
            title: "Utilisateurices",
          },
          {
            children: (
              <div>
                <Button type="danger" onClick={() => handleDeleteList()}>
                  Supprimer la liste
                </Button>
              </div>
            ),
            icon: <IconExclamationCircle size={20} />,
            key: "danger",
            title: "Danger zone",
          },
        ]
        : [],
    [],
  );

  return (
    <PrivateLayout>
      <Page size="lg">
        <Flex justify="space-between">
          <Title>
            Modifier votre liste de cadeau
          </Title>
        </Flex>
        <Space h="md" />

        <Tabs tabs={tabs} />
      </Page>
    </PrivateLayout>
  );
}
