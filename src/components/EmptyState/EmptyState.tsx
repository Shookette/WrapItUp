import "./EmptyState.css";

import { FC, PropsWithChildren, ReactNode } from "react";

type EmptyStateProps = PropsWithChildren<{
  action?: ReactNode;
  icon: ReactNode;
  title: string;
}>;

const EmptyState: FC<EmptyStateProps> = ({ action, children, icon, title }) => (
  <div className="empty-state">
    <span aria-hidden className="empty-state__icon">
      {icon}
    </span>
    <h2 className="empty-state__title">{title}</h2>
    {children && <p className="empty-state__text">{children}</p>}
    {action}
  </div>
);

export default EmptyState;
