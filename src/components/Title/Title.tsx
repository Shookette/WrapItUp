import "./Title.css";

import { FC, PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";

type TitleProps = PropsWithChildren<{
  actions?: ReactNode;
  subtitle?: ReactNode;
  variant?: "page" | "section";
}>;

const Title: FC<TitleProps> = ({
  actions,
  children,
  subtitle,
  variant = "section",
}) => {
  const Heading = variant === "page" ? "h1" : "h2";

  return (
    <div className={classNames("title", `title--${variant}`)}>
      <div className="title__heading">
        <Heading className="title__text">{children}</Heading>
        {subtitle && <p className="title__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="title__actions">{actions}</div>}
    </div>
  );
};

export default Title;
