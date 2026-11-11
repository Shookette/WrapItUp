import "./Title.css";

import { FC, PropsWithChildren, ReactNode } from "react";

type TitleProps = PropsWithChildren<{
  /** Éléments alignés à droite du titre (ex. un bouton). */
  actions?: ReactNode;
}>;

const Title: FC<TitleProps> = ({ actions, children }) => {
  if (!actions) {
    return <h2 className="title">{children}</h2>;
  }

  return (
    <div className="title title--with-actions">
      <h2 className="title__text">{children}</h2>
      {actions}
    </div>
  );
};

export default Title;
