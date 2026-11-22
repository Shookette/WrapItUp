import "./ListItem.css";

import { FC, PropsWithChildren, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { IconChevronRight, IconGift } from "@tabler/icons-react";
import Tile from "#/components/Tile/Tile.tsx";

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
      <Tile shape="square" toneFrom={listId}>
        <IconGift size={24} stroke={1.75} />
      </Tile>
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
