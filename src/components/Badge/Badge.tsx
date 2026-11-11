import "./Badge.css";

import { FC, PropsWithChildren } from "react";
import classNames from "classnames";

type BadgeProps = PropsWithChildren<{
  type?: "primary" | "danger" | "success";
}>;

const Badge: FC<BadgeProps> = ({ children, type = "primary" }) => (
  <span className={classNames("badge", `badge__type--${type}`)}>
    {children}
  </span>
);

export default Badge;
