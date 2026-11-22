import "./EmptyState.css";

import { FC, PropsWithChildren, ReactNode } from "react";
import Tile from "#/components/Tile/Tile.tsx";

type EmptyStateProps = PropsWithChildren<{
  action?: ReactNode;
  icon: ReactNode;
  title: string;
}>;

const EmptyState: FC<EmptyStateProps> = ({ action, children, icon, title }) => (
  <div className="empty-state">
    <Tile size="large">{icon}</Tile>
    <h2 className="empty-state__title">{title}</h2>
    {children && <p className="empty-state__text">{children}</p>}
    {action}
  </div>
);

export default EmptyState;
