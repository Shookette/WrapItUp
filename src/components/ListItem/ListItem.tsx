import "./ListItem.css";

import { FC, PropsWithChildren, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { IconChevronRight, IconGift } from "@tabler/icons-react";
import classNames from "classnames";

const tones = ["primary", "success", "warning"] as const;

const toneOf = (id: string) =>
  tones[[...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3];

type ListItemProps = {
  action?: ReactNode;
  listId: string;
  subtitle?: ReactNode;
  title: string;
  to: "/edit/$listId" | "/list/$listId";
};

export const ListItems: FC<PropsWithChildren> = ({ children }) => (
  <ul className="list-items">{children}</ul>
);

const ListItem: FC<ListItemProps> = ({
  action,
  listId,
  subtitle,
  title,
  to,
}) => (
  <li className="list-item">
    <Link className="list-item__link" params={{ listId }} to={to}>
      <span
        aria-hidden
        className={classNames(
          "list-item__icon",
          `list-item__icon--${toneOf(listId)}`,
        )}
      >
        <IconGift size={24} stroke={1.75} />
      </span>
      <span className="list-item__text">
        <span className="list-item__title">{title}</span>
        {subtitle && <span className="list-item__subtitle">{subtitle}</span>}
      </span>
      {!action && (
        <IconChevronRight
          aria-hidden
          className="list-item__chevron"
          size={20}
        />
      )}
    </Link>
    {action}
  </li>
);

export default ListItem;
