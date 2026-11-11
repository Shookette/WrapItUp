import "./Button.css";

import { FC, PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";
import { IconLoader2 } from "@tabler/icons-react";

type ButtonProps = PropsWithChildren<{
  /** Nom accessible, obligatoire pour un bouton icône seule. */
  ariaLabel?: string;
  icon?: ReactNode;
  isSubmit?: boolean;
  loading?: boolean;
  position?: "left" | "right";
  size?: "small" | "medium" | "large";
  type?: "primary" | "danger" | "success";
  onClick?: () => void;
}>;

const Button: FC<ButtonProps> = ({
  ariaLabel,
  children,
  icon,
  isSubmit = false,
  loading = false,
  position,
  size = "medium",
  type = "primary",
  onClick,
}) => {
  const className = classNames("button", {
    [`button__type--${type}`]: true,
    [`button__size--${size}`]: true,
    [`button__position--${position}`]: !!position,
  });

  return (
    <button
      aria-label={ariaLabel}
      className={className}
      disabled={loading}
      type={isSubmit ? "submit" : "button"}
      onClick={onClick}
    >
      {loading ? <IconLoader2 className="button__loader" /> : icon}
      {children}
    </button>
  );
};

export default Button;
