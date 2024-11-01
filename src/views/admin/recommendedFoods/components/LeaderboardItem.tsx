import React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Flex,
  Box,
  Icon,
  Image,
  Text,
  useColorModeValue,
  useMediaQuery,
  useDisclosure,
  SimpleGrid,
  Button
} from "@chakra-ui/react";
import FadeInWrapper from "components/wrapper/FadeInWrapper";
import { FaFireAlt, FaAngleRight, FaAngleDown } from "react-icons/fa";
import { useSpring, animated } from "react-spring";
import IconBox from "components/icons/IconBox";
import Card from "components/card/Card";
import MiniStatistics from "components/card/MiniStatistics";
import { ColumnChart } from "components/charts/BarCharts";
import { SuggestedMeal, NutrientMeal } from "variables/weightStats";

/**
 * Компонент за показване на елемент от класацията.
 *
 * @param {Object} props - Параметри на компонента.
 * @param {string} props.image - URL на изображението.
 * @param {string} props.name - Име на ястието.
 * @param {string} [props.count] - Брой (опционално).
 * @param {string[]} props.instructions - Инструкции за приготвяне.
 * @param {string[]} props.ingredients - Съставки.
 * @param {any} props.totals - Общи стойности (калории, протеини и т.н.).
 * @param {SuggestedMeal[] | NutrientMeal[]} props.topMeals - Най-добрите ястия.
 * @param {boolean} [props.keepOpen] - Дали да остане отворено (опционално).
 *
 * @returns {JSX.Element} Връща JSX елемент на компонента.
 */
export default function LeaderboardItem(props: {
  image: string;
  name: string;
  count?: string;
  instructions: string[];
  ingredients: string[];
  totals: any;
  topMeals: SuggestedMeal[] | NutrientMeal[];
  keepOpen?: boolean;
}) {
  const {
    image,
    name,
    count,
    instructions,
    ingredients,
    totals,
    topMeals,
    keepOpen
  } = props;

  // Определяне на цветови стойности в зависимост от режима на цветовете
  const boxBg = useColorModeValue("secondaryGray.300", "#263363");
  const textColor = useColorModeValue("brands.900", "white");
  const bgItem = useColorModeValue(
    { bg: "white", boxShadow: "0px 40px 58px -20px rgba(112, 144, 176, 0.12)" },
    { bg: "navy.700", boxShadow: "unset" }
  );
  const textColorDate = useColorModeValue("secondaryGray.600", "white");
  const chartsColor = useColorModeValue("brand.500", "white");

  // Състояния за видимост на дропдауна и мини статистиките
  const [dropdownVisible, setDropdownVisible] = React.useState(
    keepOpen || false
  );
  const [miniStatisticsVisible, setMiniStatisticsVisible] =
    React.useState(false);
  const [renderDropdown, setRenderDropdown] = React.useState(false);

  const borderColor = useColorModeValue("secondaryGray.200", "whiteAlpha.200");

  // Намиране на ранга на ястието в класацията
  const rank = topMeals
    ? topMeals.findIndex((meal) => meal.name === name) + 1
    : null;

  // Референции за модалните прозорци
  const cancelRefBMIAlert = React.useRef();
  const {
    isOpen: isOpenBMIAlert,
    onOpen: onOpenBMIAlert,
    onClose: onCloseBMIAlert
  } = useDisclosure();

  const cancelRefIngredients = React.useRef();
  const {
    isOpen: isOpenIngredients,
    onOpen: onOpenIngredients,
    onClose: onCloseIngredients
  } = useDisclosure();

  // Функция за управление на видимостта на дропдауна
  const handleDropdownToggle = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Анимация за дропдауна
  const slideAnimationDrop = useSpring({
    opacity: miniStatisticsVisible ? 1 : 0,
    transform: `translateY(${dropdownVisible ? -50 : -90}px)`,
    config: {
      tension: dropdownVisible ? 170 : 200,
      friction: dropdownVisible ? 12 : 20
    }
  });

  // useEffect за управление на позицията на мини статистиките при отваряне/затваряне на дропдауна
  React.useEffect(() => {
    const handleRestSlidePositionChange = async () => {
      if (dropdownVisible) {
        setMiniStatisticsVisible(true);
        setRenderDropdown(true);
      } else {
        setMiniStatisticsVisible(false);
        await new Promise<void>((resolve) =>
          setTimeout(() => {
            resolve();
            setRenderDropdown(false);
          }, 150)
        );
      }
    };

    handleRestSlidePositionChange();
  }, [dropdownVisible]);

  // useEffect за управление на рендирането на дропдауна при инициализация
  React.useEffect(() => {
    if (keepOpen) {
      setRenderDropdown(true);
      setMiniStatisticsVisible(true);
    }
  }, [keepOpen]);

  // Определяне на размерите на екрана
  const [isSmallScreen] = useMediaQuery("(max-width: 1400px)");
  const [isPhoneScreen] = useMediaQuery("(max-width: 767px)");
  const [isImageSquished] = useMediaQuery(
    "(min-width: 1400px) and (max-width: 1850px)"
  );
  const gridColumnCount = isSmallScreen ? 1 : 2;

  // Настройки за размерите на изображението
  const imageMinSizeSquishyPrevention = isImageSquished ? "470px" : "0px";
  const imageMaxSizeSquishyPrevention = isImageSquished ? "800px" : "500px";

  return (
    <FadeInWrapper>
      <Card
        _hover={bgItem}
        bg="transparent"
        boxShadow="unset"
        px="24px"
        py="21px"
        transition="0.2s linear"
        cursor="pointer"
        onClick={handleDropdownToggle}
        overflow="visible"
      >
        <Flex direction={{ base: "column" }} justify="center">
          <Flex position="relative" align="center" zIndex="1">
            {!renderDropdown && (
              <>
                <Image
                  src={image}
                  minW="66px"
                  maxW="66px"
                  minH="66px"
                  maxH="66px"
                  borderRadius="20px"
                  mx="16px"
                  mt="30px"
                />
                <Flex
                  mt="30px"
                  direction="column"
                  w={{ base: "70%", md: "100%" }}
                  me={{ base: "4px", md: "32px", xl: "10px", "3xl": "32px" }}
                >
                  <Flex>
                    {rank && (
                      <Text
                        fontSize="2xl"
                        mr="5px"
                        color={
                          rank === 1
                            ? "gold"
                            : rank === 2
                            ? "silver"
                            : rank === 3
                            ? "#cd7f32"
                            : textColor
                        }
                      >
                        <b>#{rank}</b>
                      </Text>
                    )}
                    <Text
                      color={textColor}
                      fontSize={{
                        base: "lg"
                      }}
                      mb="5px"
                      fontWeight="bold"
                      me="14px"
                      mt="5px"
                    >
                      {name}
                    </Text>
                  </Flex>
                  <Text
                    color="secondaryGray.600"
                    fontSize={{
                      base: "md"
                    }}
                    fontWeight="400"
                    me="14px"
                  >
                    {count}
                  </Text>
                </Flex>
              </>
            )}
            <Icon
              as={renderDropdown ? FaAngleDown : FaAngleRight}
              mr={renderDropdown ? undefined : "auto"} // Remove margin on right side if not rendering dropdown
              ml={renderDropdown ? "auto" : undefined} // Remove margin on left side if rendering dropdown
              mt={renderDropdown ? "25px" : undefined} // Adjust top margin only if rendering dropdown
              fontSize="lg"
              color={textColorDate}
            />
          </Flex>
          {renderDropdown && (
            <animated.div
              style={{ ...slideAnimationDrop, position: "relative" }}
            >
              <Card
                bg="transparent"
                minH={{ base: "800px", md: "300px", xl: "180px" }}
              >
                <Flex
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  onClick={handleDropdownToggle}
                  mt="60px"
                  flexWrap="nowrap"
                >
                  {isImageSquished && (
                    <Flex
                      minW={{ base: "100%", md: "70%" }}
                      alignItems="center"
                      mb="5px"
                      maxW="1850px"
                    >
                      {rank && (
                        <Text
                          fontSize="5xl"
                          mr="15px"
                          color={
                            rank === 1
                              ? "gold"
                              : rank === 2
                              ? "silver"
                              : rank === 3
                              ? "#cd7f32"
                              : textColor
                          }
                        >
                          <b>#{rank}</b>
                        </Text>
                      )}
                      <Text
                        color={textColor}
                        fontSize={{ base: "3xl" }}
                        mb="5px"
                        fontWeight="bold"
                        ml="14px"
                        mr="14px"
                      >
                        {name}
                      </Text>
                      <Text
                        color="secondaryGray.600"
                        fontSize={{ base: "xl" }}
                        fontWeight="400"
                        ml="14px"
                        mr="14px"
                      >
                        {count}
                      </Text>
                      <Text
                        color="secondaryGray.600"
                        fontSize={{ base: "xl" }}
                        fontWeight="400"
                        ml="14px"
                        mr="14px"
                      >
                        Крайно количество от рецептата: {totals.grams}g
                      </Text>
                      <Button
                        onClick={(event) => {
                          onOpenIngredients();
                          event.stopPropagation();
                        }}
                        borderRadius="20px"
                        zIndex="2"
                        size="lg"
                        bg="#7c6bff"
                        color="white"
                        ml="14px"
                      >
                        <Text fontSize="1xl" fontWeight="400">
                          Вижте продукти
                        </Text>
                      </Button>
                      <Button
                        onClick={(event) => {
                          onOpenBMIAlert();
                          event.stopPropagation();
                        }}
                        borderRadius="20px"
                        size="lg"
                        zIndex="2"
                        bg="#7c6bff"
                        color="white"
                        ml="14px"
                      >
                        <Text fontSize="1xl" fontWeight="400">
                          Вижте рецепта
                        </Text>
                      </Button>
                    </Flex>
                  )}
                </Flex>
                <SimpleGrid columns={gridColumnCount} gap="20px">
                  <SimpleGrid
                    columns={{
                      base: 1,
                      md: 2,
                      xl: isImageSquished ? 1 : 2
                    }}
                    gap="20px"
                  >
                    <Flex direction="column" onClick={handleDropdownToggle}>
                      <Image
                        src={image}
                        maxW={{
                          sm: "800px",
                          md: "500px",
                          lg: "500px",
                          xl: imageMaxSizeSquishyPrevention
                        }}
                        minW={{
                          sm: "0px",
                          md: "0px",
                          lg: "0px",
                          xl: imageMinSizeSquishyPrevention
                        }}
                        h={{
                          sm: "450px",
                          md: "400px",
                          xl: "400px"
                        }}
                        borderRadius="20px"
                        backgroundColor={boxBg}
                      />
                    </Flex>
                    {!isImageSquished && (
                      <Flex
                        minW="100%"
                        direction="column"
                        w={{ base: "70%", md: "100%" }}
                        mr={{
                          base: "4px",
                          md: "32px",
                          xl: "10px",
                          "3xl": "32px"
                        }}
                      >
                        {rank && (
                          <Text
                            fontSize="5xl"
                            mb="0px"
                            color={
                              rank === 1
                                ? "gold"
                                : rank === 2
                                ? "silver"
                                : rank === 3
                                ? "#cd7f32"
                                : textColor
                            }
                          >
                            <b>#{rank}</b>
                          </Text>
                        )}
                        <Text
                          color={textColor}
                          fontSize={{ base: "3xl" }}
                          mb="5px"
                          fontWeight="bold"
                          mr="14px"
                          maxW="300px"
                        >
                          {name}
                        </Text>
                        <Text
                          color="secondaryGray.600"
                          fontSize={{ base: "xl" }}
                          fontWeight="400"
                          mr="14px"
                        >
                          {count}
                        </Text>
                        <SimpleGrid
                          mt="auto"
                          mb={{ sm: "0px", md: "0px", lg: "0px", xl: "25px" }}
                          columns={{ base: 1, md: 1, xl: 1 }}
                        >
                          <Text
                            color="secondaryGray.600"
                            fontSize={{
                              base: "xl"
                            }}
                            fontWeight="400"
                            mr="14px"
                            mb="20px"
                          >
                            Грамаж за една порция: {totals.grams}g
                          </Text>
                          <Button
                            onClick={(event) => {
                              onOpenIngredients();
                              event.stopPropagation();
                            }}
                            borderRadius="20px"
                            zIndex="2"
                            size="lg"
                            bg="#7c6bff"
                            color="white"
                            maxW={{
                              sm: "800px",
                              md: "500px",
                              lg: "500px",
                              xl: "500px"
                            }}
                            mb="20px"
                          >
                            <Text fontSize="1xl" fontWeight="400">
                              Вижте продукти
                            </Text>
                          </Button>
                          <AlertDialog
                            isOpen={isOpenIngredients}
                            leastDestructiveRef={cancelRefIngredients}
                            onClose={onCloseIngredients}
                          >
                            <AlertDialogOverlay>
                              <AlertDialogContent
                                border="2px"
                                borderRadius="25px"
                                borderColor={borderColor}
                                mx={isPhoneScreen ? "20px" : "0px"}
                              >
                                <AlertDialogHeader
                                  fontSize="lg"
                                  fontWeight="bold"
                                >
                                  Продукти
                                </AlertDialogHeader>

                                <AlertDialogCloseButton borderRadius="20px" />

                                <AlertDialogBody>
                                  {ingredients.map((ingredient, index) => (
                                    <Text key={index}>{ingredient}</Text>
                                  ))}
                                </AlertDialogBody>
                                <AlertDialogFooter></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialogOverlay>
                          </AlertDialog>
                          <Button
                            onClick={(event) => {
                              onOpenBMIAlert();
                              event.stopPropagation();
                            }}
                            borderRadius="20px"
                            size="lg"
                            zIndex="2"
                            bg="#7c6bff"
                            color="white"
                            maxW={{
                              sm: "800px",
                              md: "500px",
                              lg: "500px",
                              xl: "500px"
                            }}
                          >
                            <Text fontSize="1xl" fontWeight="400">
                              Вижте рецепта
                            </Text>
                          </Button>
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
                                mx={isPhoneScreen ? "20px" : "0px"}
                              >
                                <AlertDialogHeader
                                  fontSize="lg"
                                  fontWeight="bold"
                                >
                                  Стъпки за приготвяне
                                </AlertDialogHeader>

                                <AlertDialogCloseButton borderRadius="20px" />
                                <AlertDialogBody>
                                  {instructions.map((instruction, index) => (
                                    <Text key={index}>{instruction}</Text>
                                  ))}
                                </AlertDialogBody>
                                <AlertDialogFooter></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialogOverlay>
                          </AlertDialog>
                        </SimpleGrid>
                      </Flex>
                    )}
                  </SimpleGrid>
                  <SimpleGrid
                    columns={{ base: 1, md: 2, xl: 2 }}
                    gap="20px"
                    onClick={handleDropdownToggle}
                  >
                    <Box mb={{ sm: "0px", md: "20px", lg: "20px" }}>
                      <MiniStatistics
                        startContent={
                          <IconBox
                            w="56px"
                            h="56px"
                            bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                            icon={
                              <Icon
                                w="32px"
                                h="32px"
                                as={FaFireAlt}
                                color="white"
                              />
                            }
                          />
                        }
                        name="Калории"
                        value={totals.calories.toFixed(2) + " kCal"}
                        backgroundColor={boxBg}
                      />
                      <SimpleGrid
                        columns={{ base: 1, md: 1, lg: 1, "2xl": 1 }}
                        gap="20px"
                        mt="20px"
                      >
                        <MiniStatistics
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                              icon={
                                <Icon
                                  w="32px"
                                  h="32px"
                                  as={FaFireAlt}
                                  color="white"
                                />
                              }
                            />
                          }
                          name="Въглехидрати"
                          value={totals.carbohydrates.toFixed(2) + " g"}
                          backgroundColor={boxBg}
                        />
                        <MiniStatistics
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                              icon={
                                <Icon
                                  w="32px"
                                  h="32px"
                                  as={FaFireAlt}
                                  color="white"
                                />
                              }
                            />
                          }
                          name="Мазнини"
                          value={totals.fat.toFixed(2) + " g"}
                          backgroundColor={boxBg}
                        />
                        <MiniStatistics
                          startContent={
                            <IconBox
                              w="56px"
                              h="56px"
                              bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                              icon={
                                <Icon
                                  w="32px"
                                  h="32px"
                                  as={FaFireAlt}
                                  color="white"
                                />
                              }
                            />
                          }
                          name="Протеин"
                          value={totals.protein.toFixed(2) + " g"}
                          backgroundColor={boxBg}
                        />
                      </SimpleGrid>
                    </Box>
                    <Box>
                      <MiniStatistics
                        startContent={
                          <IconBox
                            w="56px"
                            h="56px"
                            bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                            icon={
                              <Icon
                                w="32px"
                                h="32px"
                                as={FaFireAlt}
                                color="white"
                              />
                            }
                          />
                        }
                        name="Грамаж"
                        value={totals.grams + " g"}
                        backgroundColor={boxBg}
                      />

                      <Card
                        alignItems="center"
                        flexDirection="column"
                        minH={{ sm: "400px", md: "300px", lg: "300px" }}
                        minW={{ sm: "150px", md: "200px", lg: "100%" }}
                        backgroundColor={boxBg}
                        maxH="400px"
                        mt="20px"
                      >
                        <ColumnChart
                          chartData={[
                            totals.protein,
                            totals.fat,
                            totals.carbohydrates
                          ]}
                          chartLabels={["Протеин", "Мазнини", "Въглехидрати"]}
                          chartLabelName={"Нутриенти (g.)"}
                          textColor={chartsColor}
                        />
                      </Card>
                    </Box>
                  </SimpleGrid>
                </SimpleGrid>
              </Card>
            </animated.div>
          )}
        </Flex>
      </Card>
    </FadeInWrapper>
  );
}
