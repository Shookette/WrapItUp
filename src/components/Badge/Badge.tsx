import "./Badge.css";

import { FC, PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";

type BadgeProps = PropsWithChildren<{
  icon?: ReactNode;
  type?: "primary" | "danger" | "success" | "neutral";
}>;

const Badge: FC<BadgeProps> = ({ children, icon, type = "primary" }) => (
  <span className={classNames("badge", `badge__type--${type}`)}>
    {icon}
    {children}
  </span>
);

export default Badge;
