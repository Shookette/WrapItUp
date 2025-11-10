import "./Banner.css";

import { FC, ReactNode } from "react";
import classNames from "classnames";

type BannerProps = {
  children: ReactNode;
  iconPrefix?: ReactNode;
  iconSuffix?: ReactNode;
  type?: "danger" | "success";
};

const Banner: FC<BannerProps> = ({
  iconPrefix,
  children,
  iconSuffix,
  type = "success",
}) => {
  const className = classNames("banner", {
    [`banner__type--${type}`]: true,
  });
  return (
    <div className={className}>
      {iconPrefix && iconPrefix}
      <p className="banner__text">{children}</p>
      {iconSuffix && iconSuffix}
    </div>
  );
};

export default Banner;
