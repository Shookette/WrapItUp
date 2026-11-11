import "./PrivateLayout.css";

import { FC, Fragment, PropsWithChildren, useCallback, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useUserContext } from "#hooks/UserContext.tsx";
import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react";
import Center from "./Center/Center.tsx";
import Menu, { MenuItem } from "./Menu/Menu.tsx";

const PrivateLayout: FC<PropsWithChildren> = ({ children }) => {
  const { logout } = useUserContext();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await navigate({ to: "/" });
    await logout();
  }, [navigate, logout]);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        icon: <IconSettings size={14} />,
        key: "account",
        label: "Compte",
        onClick: () => navigate({ to: "/account" }),
      },
      {
        icon: <IconLogout size={14} />,
        key: "logout",
        label: "Déconnexion",
        onClick: handleLogout,
      },
    ],
    [navigate, handleLogout],
  );

  return (
    <Fragment>
      <nav className="private-layout__nav">
        <Link
          activeOptions={{ exact: true }}
          activeProps={{ className: "private-layout__link--active" }}
          className="private-layout__link"
          to="/"
        >
          Mes listes
        </Link>
        <Link
          activeProps={{ className: "private-layout__link--active" }}
          className="private-layout__link"
          to="/lists"
        >
          Listes de cadeaux
        </Link>

        <div className="private-layout__menu">
          <Menu
            icon={<IconUser size={20} stroke={1.5} />}
            items={menuItems}
            label="Compte"
          />
        </div>
      </nav>

      <Center>{children}</Center>
    </Fragment>
  );
};

export default PrivateLayout;
