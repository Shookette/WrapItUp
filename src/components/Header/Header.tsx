import "./Header.css";

import { FC } from "react";
import HomeImageUrl from "#assets/home.png";

/** Bandeau du haut, présent sur toutes les pages. */
const Header: FC = () => (
  <header className="header">
    <img alt="Logo Wrap It Up" className="header__logo" src={HomeImageUrl} />
    <h1 className="header__title">Wrap It Up !</h1>
  </header>
);

export default Header;
