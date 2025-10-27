import { FullList } from "../../interfaces/List.ts";
import { FC, useMemo } from "react";
import { ActionIcon, Table, Text } from "@mantine/core";
import { IconLink, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import Button from "../Button/Button.tsx";

type ListUserFormProps = {
  list: FullList;
  handleOnRemove: (id: string) => void;
  loading: boolean;
};

const ListUserForm: FC<ListUserFormProps> = ({
  list,
  handleOnRemove,
  loading,
}) => {
  const allowedUsers = useMemo(() => list.allowedUsers ?? [], [list]);

  async function copyLink() {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    await navigator.clipboard.writeText(`${baseUrl}/invite/${list.id}`);
    notifications.show({
      position: "top-right",
      title: "Ajouter un•e utilisateurice",
      message:
        "Le lien d'ajout d'un•e nouvel•le utilisateurice à été copié dans votre presse papiers",
    });
  }

  return (
    <div>
      <Button
        icon={<IconLink />}
        position="right"
        size="small"
        type="success"
        onClick={copyLink}
      >
        Copier le lien de l'invitation
      </Button>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Utilisateurices</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {allowedUsers.length > 0 ? (
            allowedUsers.map((user) => (
              <Table.Tr key={user.userUID}>
                <Table.Td>{user.username}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    loading={loading}
                    variant="filled"
                    aria-label="Supprimer"
                    color="red"
                    onClick={() => handleOnRemove(user.userUID)}
                  >
                    <IconTrash
                      style={{ width: "70%", height: "70%" }}
                      stroke={1.5}
                    />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={2}>
                <Text ta="center">Aucun•e utilisateurice</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default ListUserForm;
