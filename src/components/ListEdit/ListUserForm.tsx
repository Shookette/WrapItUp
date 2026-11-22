import "./ListUserForm.css";

import { FC } from "react";
import { IconCopy, IconShare, IconUsers, IconX } from "@tabler/icons-react";
import { FullList } from "#/interfaces/List.ts";
import { pickByHash } from "#/utils/tone.ts";
import { plural } from "#/utils/plural.ts";
import { useToast } from "#/components/Toast/toastContext.ts";
import Button from "#/components/Button/Button.tsx";
import EmptyState from "#/components/EmptyState/EmptyState.tsx";

type ListUserFormProps = {
  list: FullList;
  removingUserUID?: string;
  onRemove: (userUID: string) => void;
};

const avatarTones = ["primary", "success", "info", "warning"] as const;

const canShare = typeof navigator !== "undefined" && "share" in navigator;

const ListUserForm: FC<ListUserFormProps> = ({
  list,
  removingUserUID,
  onRemove,
}) => {
  const toast = useToast();
  const inviteUrl = `${window.location.origin}/invite/${list.id}`;
  const allowedUsers = list.allowedUsers ?? [];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.show({
        type: "success",
        title: "Lien d'invitation copié",
        message:
          "Envoyez-le aux personnes que vous voulez inviter : elles pourront rejoindre la liste.",
      });
    } catch (error: unknown) {
      console.error("copie du lien d'invitation :", error);
      toast.show({
        type: "danger",
        message: "Le lien n'a pas pu être copié, sélectionnez-le à la main",
      });
    }
  };

  const shareLink = async () => {
    try {
      await navigator.share({
        title: list.title,
        text: `Rejoignez ma liste de cadeaux « ${list.title} »`,
        url: inviteUrl,
      });
    } catch (error: unknown) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("partage du lien d'invitation :", error);
      }
    }
  };

  return (
    <div className="list-user-form">
      <section className="invite-block" aria-labelledby="invite-block-title">
        <h3 className="invite-block__title" id="invite-block-title">
          Inviter des proches
        </h3>
        <p className="invite-block__text">
          Toute personne connectée qui a ce lien peut rejoindre la liste et
          réserver des cadeaux.
        </p>
        <p className="invite-block__url">{inviteUrl}</p>
        <div className="invite-block__actions">
          <Button
            className="invite-block__copy"
            icon={<IconCopy size={20} />}
            type="secondary"
            onClick={copyLink}
          >
            Copier le lien
          </Button>
          {canShare && (
            <Button
              className="invite-block__share"
              icon={<IconShare size={20} />}
              type="secondary"
              onClick={shareLink}
            >
              Partager
            </Button>
          )}
        </div>
      </section>

      {allowedUsers.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={32} stroke={1.75} />}
          title="Aucun·e invité·e pour l'instant"
        >
          Les personnes qui rejoignent la liste avec le lien apparaîtront ici.
        </EmptyState>
      ) : (
        <section aria-labelledby="guests-title">
          <h3 className="guests__title" id="guests-title">
            {plural(allowedUsers.length, "invité·e", "invité·es")}
          </h3>
          <ul className="guests">
            {allowedUsers.map((user) => (
              <li className="guests__item" key={user.userUID}>
                <span
                  aria-hidden
                  className={`guests__avatar guests__avatar--${pickByHash(user.userUID, avatarTones)}`}
                >
                  {(user.username ?? "?").charAt(0).toUpperCase()}
                </span>
                <span className="guests__name">
                  {user.username ?? "Invité·e sans nom"}
                </span>
                <Button
                  ariaLabel={`Retirer ${user.username ?? "cet·te invité·e"}`}
                  icon={<IconX size={20} stroke={1.75} />}
                  loading={removingUserUID === user.userUID}
                  type="danger"
                  onClick={() => onRemove(user.userUID)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ListUserForm;
