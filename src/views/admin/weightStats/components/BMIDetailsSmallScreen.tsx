import React, { useState } from "react";
import {
  Flex,
  Text,
  Menu,
  MenuButton,
  Icon,
  Image,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  useColorModeValue,
  Box
} from "@chakra-ui/react";
import { MdOutlineInfo } from "react-icons/md";

/**
 * Компонент, който показва детайли за BMI на малък екран.
 *
 * @component
 * @returns {JSX.Element}
 *
 */
const BMIDetailsSmallScreen = () => {
  const textColor = useColorModeValue("black", "white");
  const infoBoxIconColor = useColorModeValue("black", "white");
  const bgList = useColorModeValue("secondaryGray.150", "whiteAlpha.100");
  const borderColor = useColorModeValue("secondaryGray.200", "whiteAlpha.200");
  const bgButton = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const bgHover = useColorModeValue(
    { bg: "secondaryGray.400" },
    { bg: "whiteAlpha.50" }
  );
  const bgHoverInfoBox = useColorModeValue(
    { bg: "#C6C7D4" },
    { bg: "whiteAlpha.100" }
  );
  const bgFocus = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.100" }
  );
  // Създава референции за cancel бутоните в диалоговите прозорци
  const cancelRefStatus = React.useRef();
  const cancelRefBMIAlert = React.useRef();

  // Диспечер за управление на отварянето и затварянето на статус диалогов прозорец
  const {
    isOpen: isOpenStatus,
    onOpen: onOpenStatus,
    onClose: onCloseStatus
  } = useDisclosure();

  // Диспечер за управление на отварянето и затварянето на BMI предупреждение диалогов прозорец
  const {
    isOpen: isOpenBMIAlert,
    onOpen: onOpenBMIAlert,
    onClose: onCloseBMIAlert
  } = useDisclosure();

  // Диспечер за управление на отварянето и затварянето на BMI диалогов прозорец
  const {
    isOpen: isOpenBMI,
    onOpen: onOpenBMI,
    onClose: onCloseBMI
  } = useDisclosure();

  return (
    <Flex direction="column" alignItems="center">
      <Text
        color={textColor}
        fontSize="2xl"
        ms="24px"
        fontWeight="700"
        whiteSpace="normal"
        textAlign="center"
      >
        Колко е вашият Индекс на Телесна Маса:
      </Text>
      <Menu isLazy isOpen={isOpenBMI} onClose={onCloseBMI}>
        <MenuButton
          alignItems="center"
          justifyContent="center"
          bg={bgButton}
          _hover={bgHoverInfoBox}
          _focus={bgFocus}
          _active={bgFocus}
          w="30px"
          h="30px"
          lineHeight="50%"
          onClick={onOpenBMI}
          borderRadius="20px"
          ml="10px"
        >
          <Icon as={MdOutlineInfo} color={infoBoxIconColor} w="24px" h="24px" />
        </MenuButton>
        <MenuList
          w="100%"
          minW="unset"
          ml={{ base: "2%", lg: 0 }}
          mr={{ base: "2%", lg: 0 }}
          maxW={{ base: "60%", lg: "80%" }}
          border="1px"
          borderColor={borderColor}
          backdropFilter="blur(100px)"
          bg={bgList}
          borderRadius="20px"
          p="15px"
        >
          <Box
            transition="0.2s linear"
            color={textColor}
            p="0px"
            maxW={{ base: "100%", lg: "100%" }}
            borderRadius="8px"
          >
            <MenuItem
              onClick={onOpenBMIAlert}
              borderRadius="20px"
              _hover={bgHover}
              _focus={bgFocus}
              _active={bgFocus}
            >
              <Text fontSize="1xl" fontWeight="400">
                Какво е Индекс на Телесната Маса?
              </Text>
            </MenuItem>
            <MenuItem
              onClick={onOpenStatus}
              borderRadius="20px"
              _hover={bgHover}
              _focus={bgFocus}
              _active={bgFocus}
            >
              <Text fontSize="1xl" fontWeight="400">
                Видовете състояние според ИТМ
              </Text>
            </MenuItem>
          </Box>
        </MenuList>
      </Menu>
      <AlertDialog
        isOpen={isOpenBMIAlert}
        leastDestructiveRef={cancelRefBMIAlert}
        onClose={onCloseBMIAlert}
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            border="2px"
            borderRadius="25px"
            borderColor={borderColor}
            mx="20px"
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Какво е Индекс на Телесната Маса?
            </AlertDialogHeader>

            <AlertDialogCloseButton borderRadius="20px" />

            <AlertDialogBody>
              <b>Индексът на телесната маса(ИТМ)</b> e медико-биологичен
              показател, който служи за определяне на нормалното, здравословно
              тегло при хора с различен ръст и за диагностициране на
              затлъстяване и недохранване. Индексът на телесната маса се измерва
              в килограми на квадратен метър и се определя по следната формула:
              <br />
              <Image
                src="https://wikimedia.org/api/rest_v1/media/math/render/svg/75508e7ad0fc780453684deec6aab53ea630ece7"
                alt="Dan Abramov"
              />
              <b>BMI</b> - индекс на телесната маса
              <br /> <b>W</b> - тегло в килограми
              <br /> <b>h</b> - височина в метри
            </AlertDialogBody>
            <AlertDialogFooter></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <AlertDialog
        isOpen={isOpenStatus}
        leastDestructiveRef={cancelRefStatus}
        onClose={onCloseStatus}
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            border="2px"
            borderRadius="25px"
            borderColor={borderColor}
            mx="20px"
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Видовете състояние според ИТМ:
            </AlertDialogHeader>

            <AlertDialogCloseButton borderRadius="20px" />

            <AlertDialogBody>
              <Flex align="center">
                <Text fontSize="sm" fontWeight="400" mt="10px" mb="5px">
                  <b>• Сериозно недохранване</b> - Този статус показва тежък
                  недостиг на хранителни вещества, което може да доведе до
                  сериозни проблеми със здравето и отслабване на организма.
                </Text>
              </Flex>
              <Flex align="center">
                <Text fontSize="sm" fontWeight="400" mt="10px" mb="5px">
                  <b>• Средно недохранване</b> - Този статус показва недостиган
                  на хранителни вещества на умерено ниво, което може да води до
                  отслабване и различни проблеми със здравето.
                </Text>
              </Flex>
              <Flex align="center">
                <Text fontSize="sm" fontWeight="400" mt="10px" mb="5px">
                  <b>• Леко недохранване</b> - В тази категория теглото е леко
                  под нормата, което може да създаде проблеми със здравето и да
                  наложи корекции в хранителния режим.
                </Text>
              </Flex>
              <Flex align="center">
                <Text fontSize="sm" fontWeight="400" mt="10px" mb="5px">
                  <b>• Нормално</b> - Тази категория отразява здравословно тегло
                  в съответствие с височината. Хора в тази категория имат
                  по-нисък риск от различни здравословни проблеми, свързани с
                  теглото.
                </Text>
              </Flex>
              <Flex align="center">
                <Text fontSize="sm" fontWeight="400" mt="10px" mb="5px">
                  <b>• Наднормено тегло</b> - В тази категория теглото е над
                  нормалната граница, което може да повиши риска от заболявания,
                  свързани със здравето, като диабет и сърдечно-съдови
                  заболявания.
                </Text>
              </Flex>
              <Flex align="center">
                <Text fontSize="sm" fontWeight="400" mt="10px" mb="5px">
                  <b>• Затлъстяване I Клас</b> - Теглото е значително повишено,
                  като този статус може да увеличи риска от сериозни
                  здравословни проблеми.
                </Text>
              </Flex>
              <Flex align="center">
                <Text fontSize="sm" fontWeight="400" mt="10px" mb="5px">
                  <b>• Затлъстяване II Клас</b> - Тук има по-висок риск от
                  здравословни проблеми в сравнение с предишната категория.
                  Затлъстяването става по-значително.
                </Text>
              </Flex>
              <Flex align="center">
                <Text fontSize="sm" fontWeight="400" mt="10px" mb="5px">
                  <b>• Затлъстяване III Клас</b> - Този клас показва екстремно
                  затлъстяване, което може да предизвика сериозни здравословни
                  проблеми и изисква внимание от специалист в здравеопазването.
                </Text>
              </Flex>
            </AlertDialogBody>
            <AlertDialogFooter></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};

export default BMIDetailsSmallScreen;
