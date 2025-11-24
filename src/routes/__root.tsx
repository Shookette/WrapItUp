import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { RouterContext } from "../main.tsx";
import { Box, Flex, Image } from "@mantine/core";
import HomeImageUrl from "../assets/home.png";
import Title from "../components/Title/Title.tsx";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <>
        <Box h={100} bg="red" c="white">
          <Flex align="center" gap="xl">
            <Image src={HomeImageUrl} h={100} fit="contain" w="auto" />
            <Title>Wrap It Up !</Title>
          </Flex>
        </Box>

        <Outlet />
      </>
    );
  },
});
