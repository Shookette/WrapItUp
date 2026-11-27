import "./ListPresents.css";

import { FC } from "react";
import {
  IconDotsVertical,
  IconExternalLink,
  IconGift,
  IconHeart,
  IconHeartFilled,
  IconLock,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import classNames from "classnames";
import { Present } from "#/interfaces/Present.ts";
import { isHttpUrl } from "#/utils/url.ts";
import { urlHost } from "#/utils/presents.ts";
import { plural } from "#/utils/plural.ts";
import Badge from "#/components/Badge/Badge.tsx";
import Banner from "#/components/Banner/Banner.tsx";
import Button from "#/components/Button/Button.tsx";
import EmptyState from "#/components/EmptyState/EmptyState.tsx";
import Menu from "#/components/Menu/Menu.tsx";

type ListPresentsProps = {
  addedPresentId?: string;
  presents: Present[];
  onDelete: (present: Present) => void;
  onEdit: (present: Present) => void;
  onToggleFavorite: (present: Present) => void;
};

const ListPresents: FC<ListPresentsProps> = ({
  addedPresentId,
  presents,
  onDelete,
  onEdit,
  onToggleFavorite,
}) => (
  <section aria-labelledby="presents-title" className="list-presents">
    <Banner iconPrefix={<IconLock size={20} />} type="info">
      <strong>C'est un secret.</strong> Vous ne voyez pas les cadeaux réservés
      par vos invité·es.
    </Banner>

    <h2 className="list-presents__title" id="presents-title">
      {plural(presents.length, "cadeau", "cadeaux")}
    </h2>

    {presents.length === 0 ? (
      <EmptyState
        icon={<IconGift size={32} stroke={1.75} />}
        title="Aucun cadeau pour l'instant"
      >
        Ajoutez les cadeaux qui vous feraient plaisir : titre, quelques détails
        et un lien si vous en avez un.
      </EmptyState>
    ) : (
      <ul className="list-presents__items">
        {presents.map((present) => {
          const host = isHttpUrl(present.url)
            ? urlHost(present.url)
            : undefined;
          return (
            <li
              className={classNames("list-presents__item", {
                "list-presents__item--added": present.id === addedPresentId,
              })}
              key={present.id}
            >
              <div className="list-presents__text">
                <div className="list-presents__name">
                  <span className="list-presents__present-title">
                    {present.title}
                  </span>
                  {present.favorite && (
                    <Badge icon={<IconHeartFilled size={14} />} type="warning">
                      Coup de cœur
                    </Badge>
                  )}
                  {present.id === addedPresentId && (
                    <Badge type="success">Ajouté</Badge>
                  )}
                </div>
                {present.description && (
                  <p className="list-presents__description">
                    {present.description}
                  </p>
                )}
                {host && (
                  <a
                    className="list-presents__link"
                    href={present.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <IconExternalLink aria-hidden size={14} />
                    {host}
                  </a>
                )}
              </div>

              <div className="list-presents__menu">
                <Menu
                  icon={<IconDotsVertical size={20} />}
                  items={[
                    {
                      icon: present.favorite ? (
                        <IconHeart size={16} />
                      ) : (
                        <IconHeartFilled size={16} />
                      ),
                      key: "favorite",
                      label: present.favorite
                        ? "Retirer des coups de cœur"
                        : "Marquer comme coup de cœur",
                      onClick: () => onToggleFavorite(present),
                    },
                    {
                      icon: <IconPencil size={16} />,
                      key: "edit",
                      label: "Modifier",
                      onClick: () => onEdit(present),
                    },
                    {
                      danger: true,
                      icon: <IconTrash size={16} />,
                      key: "delete",
                      label: "Supprimer",
                      onClick: () => onDelete(present),
                    },
                  ]}
                  label={`Actions pour ${present.title}`}
                  variant="ghost"
                />
              </div>

              <div className="list-presents__actions">
                <Button
                  ariaLabel={
                    present.favorite
                      ? `Retirer ${present.title} des coups de cœur`
                      : `Marquer ${present.title} comme coup de cœur`
                  }
                  icon={
                    present.favorite ? (
                      <IconHeartFilled size={20} />
                    ) : (
                      <IconHeart size={20} />
                    )
                  }
                  type="secondary"
                  onClick={() => onToggleFavorite(present)}
                />
                <Button
                  ariaLabel={`Modifier ${present.title}`}
                  icon={<IconPencil size={20} />}
                  type="secondary"
                  onClick={() => onEdit(present)}
                />
                <Button
                  ariaLabel={`Supprimer ${present.title}`}
                  icon={<IconTrash size={20} />}
                  type="danger"
                  onClick={() => onDelete(present)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

export default ListPresents;
