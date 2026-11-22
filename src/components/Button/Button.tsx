import "./Button.css";

import { FC, PropsWithChildren, ReactNode } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { buttonClassNames, ButtonStyleOptions } from "./buttonClassNames.ts";

type ButtonProps = PropsWithChildren<
  Omit<ButtonStyleOptions, "iconOnly"> & {
    ariaLabel?: string;
    icon?: ReactNode;
    isSubmit?: boolean;
    loading?: boolean;
    onClick?: () => void;
  }
>;

const Button: FC<ButtonProps> = ({
  ariaLabel,
  children,
  fullWidth,
  icon,
  isSubmit = false,
  loading = false,
  position,
  size,
  type,
  onClick,
}) => (
  <button
    aria-busy={loading || undefined}
    aria-label={ariaLabel}
    className={buttonClassNames({
      fullWidth,
      iconOnly: !!icon && !children,
      position,
      size,
      type,
    })}
    disabled={loading}
    type={isSubmit ? "submit" : "button"}
    onClick={onClick}
  >
    {loading ? <IconLoader2 aria-hidden className="button__loader" /> : icon}
    {children}
  </button>
);

export default Button;
