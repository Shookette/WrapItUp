import "./ListUserForm.css";

import { FC, useMemo } from "react";
import { IconLink, IconX } from "@tabler/icons-react";
import { FullList } from "#/interfaces/List.ts";
import { useToast } from "#/components/Toast/toastContext.ts";
import Button from "#/components/Button/Button.tsx";
import Table from "#/components/Table/Table.tsx";

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
      title: "Lien d'invitation copié",
      message:
        "Envoyez-le aux personnes que vous voulez inviter : elles pourront rejoindre la liste.",
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
        emptyMessage="Aucun·e invité·e pour l'instant"
        headers={["Invité·es", "Actions"]}
      >
        {allowedUsers.map((user) => (
          <tr className="table__row" key={user.userUID}>
            <td className="table__cell">{user.username}</td>
            <td className="table__cell">
              <Button
                ariaLabel={`Retirer ${user.username}`}
                icon={<IconX size={20} stroke={1.75} />}
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
