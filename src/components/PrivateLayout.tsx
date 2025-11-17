import { FC, Fragment, ReactNode, useCallback } from "react";
import { ActionIcon, Box, Flex, Menu, Text } from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";
import { useUserContext } from "../hooks/UserContext.tsx";
import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react";
import Center from "./Center/Center.tsx";

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

          <div style={{ marginLeft: "auto" }}>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon
                  variant="filled"
                  size="lg"
                  radius="xl"
                  aria-label="Compte"
                  color="green.7"
                >
                  <IconUser
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                  />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<IconSettings size={14} />}>
                  <Link to="/account" style={{ marginLeft: "auto" }}>
                    <Text td="underline" size="lg" c="green.7" fw="bold">
                      Compte
                    </Text>
                  </Link>
                </Menu.Item>

                <Menu.Item leftSection={<IconLogout size={14} />}>
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
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </Flex>
      </Box>

      <Center>
        {children}
      </Center>
    </Fragment>
  );
};

export default PrivateLayout;
