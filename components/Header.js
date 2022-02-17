import React from "react";
import { Flex, Button, Box, Text, Link } from "rebass/styled-components";

import { useRouter } from "next/router";

export default function Header({ color }) {
  const router = useRouter();

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      py={2}
      px={[4]}
      mb={4}
      minHeight={[70, 80]}
      sx={{
        zIndex: 4,
        position: "relative",
        width: "180px",
      }}
    >
      <Box sx={{}}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Text
            fontWeight="bold"
            color="white"
            fontSize={24}
            sx={{
              ":hover": {
                color: "api",
              },
            }}
          >
            <Flex
              alignItems="flex-start"
              color={color || "primary"}
              sx={{
                ":hover": {
                  color: color || "primaryLight",
                  opacity: color ? 0.9 : 1,
                },
              }}
            >
              splits ⚡
            </Flex>
          </Text>
        </Link>
      </Box>
    </Flex>
  );
}
