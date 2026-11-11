import "./Card.css";

import { FC, PropsWithChildren } from "react";

/** Carte encadrée (ex. un cadeau dans une liste). */
const Card: FC<PropsWithChildren> = ({ children }) => (
  <div className="card">{children}</div>
);

export default Card;
