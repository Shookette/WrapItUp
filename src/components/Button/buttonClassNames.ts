import classNames from "classnames";

export type ButtonType = "primary" | "secondary" | "danger" | "success";
export type ButtonSize = "small" | "medium" | "large";

export type ButtonStyleOptions = {
  fullWidth?: boolean;
  iconOnly?: boolean;
  position?: "left" | "right";
  size?: ButtonSize;
  type?: ButtonType;
};

export const buttonClassNames = ({
  fullWidth = false,
  iconOnly = false,
  position,
  size = "medium",
  type = "primary",
}: ButtonStyleOptions = {}) =>
  classNames("button", `button__type--${type}`, `button__size--${size}`, {
    "button--full-width": fullWidth,
    "button--icon": iconOnly,
    [`button__position--${position}`]: !!position,
  });
