import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { RouterContext } from "../main.tsx";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useMemo } from "react";
import { Text, Box, Flex, Image, Title } from "@mantine/core";
import HomeImageUrl from "../assets/home.png";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    const { isAuthenticated } = useUserContext();

    const isLoggedIn = useMemo(
      () => (
        <Box component="nav" h={40} bg="red.4" color="green" pl="8">
          <Flex gap="xl" align="center" h="inherit">
            <Link
              to="/"
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
          </Flex>
        </Box>
      ),
      [],
    );

    return (
      <>
        <Box h={100} bg="red" c="white">
          <Flex align="center" gap="xl">
            <Image src={HomeImageUrl} h={100} fit="contain" w="auto" />
            <Title order={1}>Wrap It Up !</Title>
          </Flex>
        </Box>
        {isAuthenticated && isLoggedIn}
        <Outlet />
      </>
    );
  },
});
