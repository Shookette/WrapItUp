import "./ListUserForm.css";

import { FC, useMemo } from "react";
import { IconLink, IconTrash } from "@tabler/icons-react";
import { FullList } from "../../interfaces/List.ts";
import { useToast } from "../Toast/toastContext.ts";
import Button from "../Button/Button.tsx";
import Table from "../Table/Table.tsx";

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
  const toast = useToast();
  const allowedUsers = useMemo(() => list.allowedUsers ?? [], [list]);

  async function copyLink() {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    await navigator.clipboard.writeText(`${baseUrl}/invite/${list.id}`);
    toast.show({
      title: "Ajouter un•e utilisateurice",
      message:
        "Le lien d'ajout d'un•e nouvel•le utilisateurice à été copié dans votre presse papiers",
    });
  }

  return (
    <div className="list-user-form">
      <Button
        icon={<IconLink />}
        position="right"
        size="small"
        type="success"
        onClick={copyLink}
      >
        Copier le lien de l'invitation
      </Button>

      <Table
        emptyMessage="Aucun•e utilisateurice"
        headers={["Utilisateurices", "Actions"]}
        isEmpty={allowedUsers.length === 0}
      >
        {allowedUsers.map((user) => (
          <tr className="table__row" key={user.userUID}>
            <td className="table__cell">{user.username}</td>
            <td className="table__cell">
              <Button
                ariaLabel="Supprimer"
                icon={<IconTrash size={16} stroke={1.5} />}
                loading={loading}
                size="small"
                type="danger"
                onClick={() => handleOnRemove(user.userUID)}
              />
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default ListUserForm;
