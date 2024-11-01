import { Spinner, Box, Text } from "@chakra-ui/react";

/**
 * Компонент за показване на индикатор за зареждане.
 * Визуализира спинер и текст "Зареждане..." по централната част на екрана.
 *
 * @returns {JSX.Element} Визуален елемент с индикатор за зареждане.
 */
const Loading = () => {
  return (
    <Box
      textAlign="center"
      mt="10"
      backgroundImage="none"
      transition="background-image 0.2s ease-in-out"
    >
      <Spinner size="xl" color="brand.500" />
      <Text mt="4" fontSize="lg" color="gray.600">
        Зареждане...
      </Text>
    </Box>
  );
};

export default Loading;
