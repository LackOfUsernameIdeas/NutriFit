import React from "react";
// Chakra imports
import {
  Box,
  Flex,
  Icon,
  Tooltip,
  SimpleGrid,
  useColorMode,
  useColorModeValue,
  useMediaQuery,
  Text,
  Link
} from "@chakra-ui/react";
import GenderedDropdowns from "./components/GenderedDropdowns";
import AllUsersDropdown from "./components/AllUsersDropdown";
import Loading from "../weightStats/components/Loading";
import { ColumnChart } from "components/charts/BarCharts";
import RecipeWidget from "components/card/RecipeWidget";
import RecipeModal from "components/rankings/RecipeModal";
import Card from "components/card/Card";
import { useSpring, animated } from "react-spring";
import { MdFlatware } from "react-icons/md";
import { HiMiniArrowUturnRight } from "react-icons/hi2";
import { SuggestedMeal } from "../../../variables/weightStats";
import FadeInWrapper from "components/wrapper/FadeInWrapper";
import backgroundImageWhite from "../../../assets/img/layout/blurry-gradient-haikei-light.svg";
import backgroundImageDark from "../../../assets/img/layout/blurry-gradient-haikei-dark.svg";
import { GenderAverageStats, Deviations } from "../../../variables/weightStats";
import DeviationsAndHealthStatuses from "./components/DeviationsAndHealthStatuses";

interface LinearGradientTextProps {
  text: any;
  gradient: string;
  fontSize?: string;
  fontFamily?: string;
  mr?: string;
}

const LinearGradientText: React.FC<LinearGradientTextProps> = ({
  text,
  gradient,
  fontSize,
  fontFamily,
  mr
}) => (
  <Text
    as="span"
    fontSize={fontSize}
    fontFamily={fontFamily}
    fontWeight="bold"
    mr={mr}
    style={{
      backgroundImage: gradient,
      WebkitBackgroundClip: "text",
      color: "transparent"
    }}
  >
    {text}
  </Text>
);

export default function UserReports() {
  const { colorMode } = useColorMode();
  const backgroundImage =
    colorMode === "light" ? backgroundImageWhite : backgroundImageDark;
  const chartsColor = useColorModeValue("brand.500", "white");
  const gradientLight = "linear-gradient(90deg, #422afb 0%, #715ffa 100%)";
  const gradientDark = "linear-gradient(90deg, #715ffa 0%, #422afb 100%)";
  const gradient = useColorModeValue(gradientLight, gradientDark);
  const gradientFit = useColorModeValue(gradientDark, gradientLight);
  const fontWeight = useColorModeValue("500", "100");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const color = useColorModeValue("#715ffa", "#422afb");
  const bgHover = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.50" }
  );
  const bgFocus = useColorModeValue(
    { bg: "secondaryGray.200" },
    { bg: "whiteAlpha.100" }
  );
  // State-ове за данните от нашето API
  const [allMeals, setAllMeals] = React.useState<SuggestedMeal[] | []>([
    {
      name: "Шопска салата",
      count: 11,
      mealData: {
        totals: {
          calories: 200,
          carbohydrates: 12,
          grams: 200,
          fat: 16,
          protein: 4
        },
        name: "Шопска салата",
        recipeQuantity: 200,
        image:
          "https://upload.wikimedia.org/wikipedia/commons/0/09/Chopska.jpg",
        ingredients: [
          "100 г домати",
          "100 г краставици",
          "30 г сирене",
          "1 ч.л. олио",
          "Магданоз"
        ],
        instructions: [
          "1.Нарежете краставиците и доматите.",
          "2.Сложете ги в чиния и поръсете с натрошено сирене и магданоз.",
          "3.Полейте с олио."
        ]
      }
    }
  ]);
  const [mealLoading, setMealLoading] = React.useState(false);
  const [averageStats, setAverageStats] = React.useState<GenderAverageStats>({
    male: {
      totalUsers: 0,
      averageCalories: 0,
      averageProtein: 0,
      averageCarbs: 0,
      averageFat: 0,
      averageWeight: 0,
      averageBodyFatPercentage: 0
    },
    female: {
      totalUsers: 0,
      averageCalories: 0,
      averageProtein: 0,
      averageCarbs: 0,
      averageFat: 0,
      averageWeight: 0,
      averageBodyFatPercentage: 0
    }
  });
  const [deviations, setDeviations] = React.useState<Deviations>();

  const [allUsersHealthStatesLabels, setAllUsersHealthStatesLabels] =
    React.useState<string[]>([]);
  const [allUsersHealthStatesData, setAllUsersHealthStatesData] =
    React.useState<number[]>([]);
  // State-ове за дропдауните
  const [dropdownVisible, setDropdownVisible] = React.useState(false);
  const handleDropdownToggle = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const [dropdownVisibleMale, setDropdownVisibleMale] = React.useState(true);
  const handleDropdownToggleMale = () => {
    setDropdownVisibleMale(!dropdownVisibleMale);
  };
  const [dropdownVisibleFemale, setDropdownVisibleFemale] =
    React.useState(true);
  const handleDropdownToggleFemale = () => {
    setDropdownVisibleFemale(!dropdownVisibleFemale);
  };

  // Анимации за компонентите под дропдауна при негово движение
  const slideAnimationStats = useSpring({
    transform: `translateY(${
      dropdownVisibleMale || dropdownVisibleFemale ? -50 : 0
    }px)`,
    config: {
      tension: dropdownVisibleMale || dropdownVisibleFemale ? 170 : 200,
      friction: dropdownVisibleMale || dropdownVisibleFemale ? 12 : 20
    }
  });

  const slideAnimation = useSpring({
    transform: `translateY(${dropdownVisible ? -50 : 0}px)`,
    config: {
      tension: dropdownVisible ? 170 : 200,
      friction: dropdownVisible ? 12 : 20
    }
  });

  // useEffect за дърпане на топ 10 най препоръчани ястия.
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://nutri-api.noit.eu/getTop10Meals",
          {
            headers: {
              "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
            }
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data for top 10 meals");
        }
        const top10meals = await response.json();

        console.log("top10meals: ", top10meals.top10meals);
        // Set your state variables accordingly
        setAllMeals(top10meals.top10meals);
        setMealLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMealLoading(false);
      }
    };

    fetchData();
  }, []);

  // useEffect за дърпане на отклоненията на OpenAI и Gemini.
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://nutri-api.noit.eu/getAllDeviations",
          {
            headers: {
              "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
            }
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const { openAI, gemini } = await response.json();

        console.log("openAI: ", openAI, "gemini: ", gemini);
        // Set your state variables accordingly
        setDeviations({
          openAI: {
            averageDeviation: openAI.averageDeviation,
            maxDeviation: openAI.maxDeviation,
            averageDeviationPercentage: openAI.averageDeviationPercentage
          },
          gemini: {
            averageDeviation: gemini.averageDeviation,
            maxDeviation: gemini.maxDeviation,
            averageDeviationPercentage: gemini.averageDeviationPercentage
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  console.log("deviations: ", deviations);
  // useEffect за дърпане на състоянията на всички потребители.
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://nutri-api.noit.eu/getAllHealthStatuses",
          {
            headers: {
              "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
            }
          }
        );
        if (response.ok) {
          const { labels: healthStatuses, counts: healthStatusesCount } =
            await response.json();

          console.log(
            "healthStatuses: ",
            healthStatuses,
            "healthStatusesCount: ",
            healthStatusesCount
          );
          setAllUsersHealthStatesLabels(healthStatuses);
          setAllUsersHealthStatesData(healthStatusesCount);
        } else {
          console.error("Failed to fetch data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  // useEffect за дърпане на средните данни на потребителите.
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://nutri-api.noit.eu/getAverageStats",
          {
            headers: {
              "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
            }
          }
        );

        if (response.ok) {
          const averageStats = await response.json();
          setAverageStats(averageStats);
        } else {
          console.error("Failed to fetch data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  console.log("averageStats: ", averageStats);
  const barChartLabels = allMeals.slice(0, 5).map((entry) => {
    const words = entry.name.split(" ");
    const wordGroups = [];
    for (let i = 0; i < words.length; i += 2) {
      const group = [words[i]];
      if (words[i + 1]) {
        group.push(words[i + 1]);
      }
      wordGroups.push(group.join(" "));
    }
    return wordGroups;
  });
  console.log(barChartLabels);
  const barChartForTopSuggestions = allMeals
    .slice(0, 5)
    .map((entry) => entry.count);

  const [isSmallScreen] = useMediaQuery("(max-width: 767px)");

  return (
    <FadeInWrapper>
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Box>
          <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap="20px" mb="20px">
            <Card>
              <Flex
                justify={isSmallScreen && "center"}
                w="100%"
                mb="5px"
                flexWrap="wrap"
                textAlign={isSmallScreen ? "center" : "start"}
              >
                <Text fontSize="5xl" mr="2">
                  Добре дошли в{" "}
                </Text>
                <LinearGradientText
                  text={<b>Nutri</b>}
                  gradient={gradient}
                  fontSize="5xl"
                  fontFamily="DM Sans"
                />
                <LinearGradientText
                  text={<b>Fit⠀</b>}
                  gradient={gradientFit}
                  fontFamily="Leckerli One"
                  fontSize="5xl"
                  mr="2px"
                />
              </Flex>
            </Card>
            <Card>
              <Flex justify="left">
                <Text fontSize="2xl">
                  Бъдете винаги във форма и в оптимално здравословно състояние с
                  помощта на изкуствен интелект!
                </Text>
              </Flex>
            </Card>
          </SimpleGrid>
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 2, "2xl": 2 }}
            gap="20px"
            mb="20px"
          >
            <Card borderColor={borderColor} borderWidth="3px">
              <Text
                fontSize="3xl"
                alignContent="center"
                textAlign="center"
                style={{
                  backgroundImage: gradient,
                  WebkitBackgroundClip: "text",
                  color: "transparent"
                }}
              >
                <b>Най-често препоръчвано ястие от NutriFit</b>
              </Text>
            </Card>
            {!isSmallScreen && (
              <Card
                borderColor={borderColor}
                borderWidth="3px"
                maxH={{ sm: "400px", md: "600px", lg: "530px" }}
              >
                <Text
                  fontSize="3xl"
                  alignContent="center"
                  textAlign="center"
                  style={{
                    backgroundImage: gradient,
                    WebkitBackgroundClip: "text",
                    color: "transparent"
                  }}
                >
                  <b>Топ 5 най-препоръчвани ястия от NutriFit</b>
                </Text>
              </Card>
            )}
            {mealLoading ? (
              <Card borderColor={borderColor} borderWidth="3px">
                <Flex justify="center" align="center" minH="400px">
                  <Loading />
                </Flex>
              </Card>
            ) : (
              <RecipeWidget
                name={
                  <Flex justify="center" w="100%" overflow="hidden">
                    <Tooltip label={allMeals[0]?.name} borderRadius="10px">
                      <Text
                        fontSize="2xl"
                        whiteSpace="nowrap"
                        maxW="360px"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {allMeals[0]?.name || "Няма рецепта"}
                      </Text>
                    </Tooltip>
                  </Flex>
                }
                author={allMeals[0]?.name}
                image={allMeals[0]?.mealData?.image}
                values={
                  <Box>
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      mb="30px"
                      mt={{ sm: "50px", md: "30px", lg: "10px", xl: "0px" }}
                    >
                      <Icon
                        as={MdFlatware}
                        boxSize={6}
                        color="purple.500"
                        mr={2}
                      />
                      <Text
                        textStyle="italic"
                        fontSize={{
                          base: "sm",
                          md: "md",
                          lg: "lg"
                        }}
                        fontStyle="italic"
                      >
                        Грамаж: {`${allMeals[0]?.mealData?.totals?.grams} g`}
                      </Text>
                    </Flex>
                    <Flex
                      direction={{ base: "column", md: "row" }}
                      justify="center"
                      pt="5px"
                      w="100%"
                      mb="2%"
                      mt="2%"
                    >
                      <SimpleGrid
                        columns={{ base: 2, md: 2, lg: 2 }}
                        gap="10px"
                      >
                        <Text
                          textStyle="italic"
                          fontSize={{
                            base: "sm",
                            md: "md",
                            lg: "lg"
                          }}
                          fontStyle="italic"
                        >
                          Калории:{" "}
                          {`${allMeals[0]?.mealData?.totals?.calories} g`}
                        </Text>
                        <Text
                          textStyle="italic"
                          fontSize={{
                            base: "sm",
                            md: "md",
                            lg: "lg"
                          }}
                          mb={{ base: "2%", md: 0, lg: "3%" }}
                          fontStyle="italic"
                        >
                          Въглехидрати:{" "}
                          {`${allMeals[0]?.mealData?.totals?.carbohydrates} g`}
                        </Text>
                        <Text
                          textStyle="italic"
                          fontSize={{
                            base: "sm",
                            md: "md",
                            lg: "lg"
                          }}
                          fontStyle="italic"
                        >
                          Протеин:{" "}
                          {`${allMeals[0]?.mealData?.totals?.protein} g`}
                        </Text>
                        <Text
                          textStyle="italic"
                          fontSize={{
                            base: "sm",
                            md: "md",
                            lg: "lg"
                          }}
                          mb={{ base: "2%", md: 0, lg: "3%" }}
                          fontStyle="italic"
                        >
                          Мазнини: {`${allMeals[0]?.mealData?.totals?.fat} g`}
                        </Text>
                      </SimpleGrid>
                    </Flex>
                    <Flex mt="20px" alignItems="center" justifyContent="center">
                      <RecipeModal
                        title="Рецепта"
                        ingredients={allMeals[0]?.mealData?.ingredients}
                        instructions={allMeals[0]?.mealData?.instructions}
                        recipeQuantity={allMeals[0]?.mealData?.recipeQuantity}
                      />
                    </Flex>
                  </Box>
                }
              />
            )}
            {isSmallScreen && (
              <Card
                borderColor={borderColor}
                borderWidth="3px"
                maxH={{ sm: "400px", md: "600px", lg: "530px" }}
              >
                <Text
                  fontSize="3xl"
                  alignContent="center"
                  textAlign="center"
                  style={{
                    backgroundImage: gradient,
                    WebkitBackgroundClip: "text",
                    color: "transparent"
                  }}
                >
                  <b>Топ 5 най-препоръчвани ястия от NutriFit</b>
                </Text>
              </Card>
            )}
            <Box maxH={{ sm: "400px", md: "595px", lg: "530px" }}>
              <Card
                alignItems="center"
                flexDirection="column"
                h="100%"
                w="100%"
                minH={{ sm: "400px", md: "300px", lg: "auto" }}
                minW={{ sm: "200px", md: "200px", lg: "auto" }}
                borderColor={borderColor}
                borderWidth="3px"
              >
                {mealLoading ? (
                  <Flex justify="center" align="center" minH="400px">
                    <Loading />
                  </Flex>
                ) : (
                  <ColumnChart
                    chartLabels={barChartLabels}
                    chartData={barChartForTopSuggestions}
                    chartLabelName="Сравнение на препоръчани храни"
                    textColor={chartsColor}
                    color="#523bff"
                  />
                )}
              </Card>
            </Box>
          </SimpleGrid>
          <DeviationsAndHealthStatuses
            allUsersHealthStatesData={allUsersHealthStatesData}
            allUsersHealthStatesLabels={allUsersHealthStatesLabels}
            deviations={deviations}
          />
          <GenderedDropdowns
            averageStats={averageStats}
            dropdownVisibleFemale={dropdownVisibleFemale}
            dropdownVisibleMale={dropdownVisibleMale}
            handleDropdownToggleFemale={handleDropdownToggleFemale}
            handleDropdownToggleMale={handleDropdownToggleMale}
          />
          <animated.div
            style={{ ...slideAnimationStats, position: "relative" }}
          >
            <AllUsersDropdown
              averageStats={averageStats}
              dropdownVisible={dropdownVisible}
              handleDropdownToggle={handleDropdownToggle}
            />
            <animated.div style={{ ...slideAnimation, position: "relative" }}>
              <Card
                minH="200px"
                backgroundImage={`url(${backgroundImage})`}
                backgroundRepeat="no-repeat"
                backgroundSize="cover"
                backgroundPosition="center"
                transition="background-image 0.5s ease-in-out"
                mt="20px"
                mb="20px"
              >
                <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="20px">
                  <Link href="#/admin/weight">
                    <Card _hover={{ bg: bgHover }} _focus={bgFocus} minH="100%">
                      <Flex pt="5px" w="100%">
                        <LinearGradientText
                          text={<b>Калкулации за теглото Ви </b>}
                          gradient={gradient}
                          fontSize="xl"
                          mr="2"
                        />
                        <Icon
                          w="20px"
                          h="20px"
                          as={HiMiniArrowUturnRight}
                          color={color}
                          mt="3px"
                        />
                      </Flex>
                      <Flex justify="center" mt="1%" pt="10px">
                        <Text fontWeight={fontWeight} fontSize="l">
                          Проследете вашето телесно изменение, посредством
                          интерактивни диаграми и статистики!
                        </Text>
                      </Flex>
                    </Card>
                  </Link>
                  <Link href="#/admin/mealplan">
                    <Card _hover={{ bg: bgHover }} _focus={bgFocus} minH="100%">
                      <Flex pt="5px" w="100%">
                        <LinearGradientText
                          text={<b>Хранителен план </b>}
                          gradient={gradient}
                          fontSize="xl"
                          mr="2"
                        />
                        <Icon
                          w="20px"
                          h="20px"
                          as={HiMiniArrowUturnRight}
                          color={color}
                          mt="3px"
                        />
                      </Flex>
                      <Flex justify="center" mt="1%" pt="10px">
                        <Text fontWeight={fontWeight} fontSize="l">
                          Създайте подходящия за вас хранителен план с изкуствен
                          интелект в зависимост от интензивността на физическо
                          натоварване!
                        </Text>
                      </Flex>
                    </Card>
                  </Link>
                  <Link href="#/admin/top-meals">
                    <Card _hover={{ bg: bgHover }} _focus={bgFocus} minH="100%">
                      <Flex pt="5px" w="100%">
                        <LinearGradientText
                          text={<b>Класации </b>}
                          gradient={gradient}
                          fontSize="xl"
                          mr="2"
                        />
                        <Icon
                          w="20px"
                          h="20px"
                          as={HiMiniArrowUturnRight}
                          color={color}
                          mt="3px"
                        />
                      </Flex>
                      <Flex justify="center" mt="1%" pt="10px">
                        <Text fontWeight={fontWeight} fontSize="l">
                          Запознайте се с нашите многобройни статистики и
                          класации за най-препоръчвани ястия от NutriFit!
                        </Text>
                      </Flex>
                    </Card>
                  </Link>
                  <Link href="#/admin/contact">
                    <Card _hover={{ bg: bgHover }} _focus={bgFocus} minH="100%">
                      <Flex pt="5px" w="100%">
                        <LinearGradientText
                          text={<b>Контакт </b>}
                          gradient={gradient}
                          fontSize="xl"
                          mr="2"
                        />
                        <Icon
                          w="20px"
                          h="20px"
                          as={HiMiniArrowUturnRight}
                          color={color}
                          mt="3px"
                        />
                      </Flex>
                      <Flex justify="center" mt="1%" pt="10px">
                        <Text fontWeight={fontWeight} fontSize="l">
                          Ако имате проблем или препоръка, попълнете бланката и
                          ни изпратете съобщение!
                        </Text>
                      </Flex>
                    </Card>
                  </Link>
                </SimpleGrid>
              </Card>
            </animated.div>
          </animated.div>
        </Box>
      </Box>
    </FadeInWrapper>
  );
}
