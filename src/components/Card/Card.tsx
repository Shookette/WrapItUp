import "./Card.css";

import { FC, PropsWithChildren } from "react";

const Card: FC<PropsWithChildren> = ({ children }) => (
  <div className="card">{children}</div>
);

export default Card;
