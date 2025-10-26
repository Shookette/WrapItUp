import { List } from "../interfaces/List";
import { FC } from "react";
import { ActionIcon, Button, Table } from "@mantine/core";
import { IconLink, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

type ListUserFormProps = {
  list: List;
  handleOnRemove: (id: string) => void;
  loading: boolean;
};

const ListUserForm: FC<ListUserFormProps> = ({
  list,
  handleOnRemove,
  loading,
}) => {
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
        mb={30}
        style={{ display: "block", marginLeft: "auto" }}
        color="green"
        onClick={copyLink}
      >
        <IconLink style={{ marginRight: "10px" }} />
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
          {(list.allowedUsers ?? []).map((user) => (
            <Table.Tr key={user.userUID}>
              <Table.Td>{user.username}</Table.Td>
              <Table.Td>wip</Table.Td>
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
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default ListUserForm;
