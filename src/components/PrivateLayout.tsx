import "./PrivateLayout.css";

import { FC, PropsWithChildren, useCallback, useMemo } from "react";
import { Link, LinkProps, useNavigate } from "@tanstack/react-router";
import classNames from "classnames";
import { useUserContext } from "#/hooks/UserContext.tsx";
import {
  IconChevronLeft,
  IconGift,
  IconList,
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import LogoUrl from "#/assets/logo.svg";
import Menu, { MenuItem } from "./Menu/Menu.tsx";

type PrivateLayoutProps = PropsWithChildren<{
  back?: { label: string; to: LinkProps["to"] };
}>;

const navLinks = [
  { exact: true, icon: IconList, label: "Mes listes", to: "/" },
  { exact: false, icon: IconGift, label: "Listes partagées", to: "/lists" },
] as const;

const bottomNavLinks = [
  ...navLinks,
  { exact: false, icon: IconUser, label: "Compte", to: "/account" },
] as const;

const PrivateLayout: FC<PrivateLayoutProps> = ({ back, children }) => {
  const { logout } = useUserContext();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await navigate({ to: "/" });
    await logout();
  }, [navigate, logout]);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        icon: <IconSettings size={16} />,
        key: "account",
        label: "Compte",
        onClick: () => navigate({ to: "/account" }),
      },
      {
        icon: <IconLogout size={16} />,
        key: "logout",
        label: "Déconnexion",
        onClick: handleLogout,
      },
    ],
    [navigate, handleLogout],
  );

  return (
    <div
      className={classNames("private-layout", {
        "private-layout--with-bottom-nav": !back,
      })}
    >
      <header className="app-bar">
        {back ? (
          <Link className="app-bar__back app-bar__mobile" to={back.to}>
            <IconChevronLeft aria-hidden size={24} />
            {back.label}
          </Link>
        ) : (
          <Link className="app-bar__brand app-bar__mobile" to="/">
            <img alt="" className="app-bar__logo" src={LogoUrl} />
            Wrap It Up
          </Link>
        )}

        <Link className="app-bar__brand app-bar__desktop" to="/">
          <img alt="" className="app-bar__logo" src={LogoUrl} />
          Wrap It Up
        </Link>

        <nav
          aria-label="Navigation principale"
          className="app-bar__nav app-bar__desktop"
        >
          {navLinks.map((link) => (
            <Link
              activeOptions={{ exact: link.exact }}
              activeProps={{ "aria-current": "page" }}
              className="app-bar__link"
              key={link.to}
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="app-bar__menu app-bar__desktop">
          <Menu
            icon={<IconUser size={20} stroke={1.75} />}
            items={menuItems}
            label="Compte"
          />
        </div>
      </header>

      <main className="private-layout__main">
        {back && (
          <Link className="private-layout__back" to={back.to}>
            <IconChevronLeft aria-hidden size={18} />
            {back.label}
          </Link>
        )}
        {children}
      </main>

      {!back && (
        <nav aria-label="Navigation principale" className="bottom-nav">
          {bottomNavLinks.map(({ exact, icon: Icon, label, to }) => (
            <Link
              activeOptions={{ exact }}
              activeProps={{ "aria-current": "page" }}
              className="bottom-nav__link"
              key={to}
              to={to}
            >
              <Icon aria-hidden size={24} stroke={1.75} />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
};

export default PrivateLayout;
