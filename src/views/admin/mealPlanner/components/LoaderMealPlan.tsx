import { Spinner, Box, Text } from "@chakra-ui/react";

/**
 * Компонент за показване на индикатор за зареждане при генериране на хранителен режим.
 *
 * @returns {JSX.Element} - Връща компонент, показващ индикатор за зареждане и текстово съобщение.
 */
const MealLoading = () => {
  return (
    <Box
      textAlign="center" // Подравняване на текста в центъра
      mt="10" // Отстояние отгоре
      backgroundImage="none" // Без фоново изображение
      transition="background-image 0.2s ease-in-out" // Плавен преход на фоновото изображение
    >
      <Spinner size="xl" color="brand.500" /> {/* Индикатор за зареждане */}
      <Text mt="4" fontSize="3xl" color="gray.600">
        Генерирането на хранителния режим от AI може да отнеме около минута...
      </Text>
    </Box>
  );
};

export default MealLoading;
