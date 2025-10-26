import { FC, Fragment, ReactNode, useCallback } from "react";
import { Box, Flex, Text } from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";
import { useUserContext } from "../hooks/UserContext.tsx";

interface Props {
  children: ReactNode;
}

const PrivateLayout: FC<Props> = ({ children }) => {
  const { logout } = useUserContext();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await navigate({ to: "/" });
    await logout();
  }, [navigate, logout]);

  return (
    <Fragment>
      <Box component="nav" h={40} bg="red.4" color="green" pl="8" pr="8">
        <Flex gap="xl" align="center" h="inherit">
          <Link
            to="/"
            style={{ textDecoration: "none" }}
            activeProps={{ className: "underline" }}
          >
            <Text td="underline" size="lg" c="green.7" fw="bold">
              Mes listes
            </Text>
          </Link>
          <Link
            to="/lists"
            style={{ textDecoration: "none" }}
            activeProps={{ className: "underline" }}
          >
            <Text td="underline" size="lg" c="green.7" fw="bold">
              Listes de cadeaux
            </Text>
          </Link>
          <Link to="/new" style={{ textDecoration: "none" }}>
            <Text td="underline" size="lg" c="green.7" fw="bold">
              Ajouter une liste
            </Text>
          </Link>

          <Link to="/account" style={{ marginLeft: "auto" }}>
            <Text td="underline" size="lg" c="green.7" fw="bold">
              Compte
            </Text>
          </Link>

          <Text
            style={{ cursor: "pointer" }}
            td="underline"
            size="lg"
            c="green.7"
            fw="bold"
            onClick={handleLogout}
          >
            Déconnexion
          </Text>
        </Flex>
      </Box>

      {children}
    </Fragment>
  );
};

export default PrivateLayout;
