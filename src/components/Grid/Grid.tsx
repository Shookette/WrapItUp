import classNames from "classnames";
import "./Grid.css";

import { FC, PropsWithChildren } from "react";

type GridProps = PropsWithChildren<{
  size?: "sm" | "md" | "lg";
}>;

const Grid: FC<GridProps> = ({ size = "md", children }) => {
  const className = classNames("grid", {
    [`grid__size--${size}`]: true,
  });

  return <div className={className}>{children}</div>;
};

export default Grid;
