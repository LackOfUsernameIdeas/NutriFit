import React from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  useColorModeValue,
  Text,
  useMediaQuery,
  IconButton
} from "@chakra-ui/react";
import FadeInWrapper from "components/wrapper/FadeInWrapper";
import {
  getFirstAndLastTopMealsByCollection,
  getFirst50TopMealsByCollection
} from "database/getFunctions";
import Loading from "views/admin/weightStats/components/Loading";
import LeaderBoardItemSmall from "components/rankings/LeaderboardItemSmall";
import Card from "components/card/Card";
import { useSpring, animated } from "react-spring";
import { ColumnChart } from "components/charts/BarCharts";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { NutrientMeal } from "../../../variables/weightStats";
import Dropdown from "components/dropdowns/Dropdown";
interface DropdownState {
  currentPage: number;
}

export default function TopMeals() {
  const chartsColor = useColorModeValue("brand.500", "white");
  const [loading, setLoading] = React.useState(true);
  const dropdownBoxBg = useColorModeValue("secondaryGray.300", "navy.700");
  const ITEMS_PER_PAGE = 5;
  const [dropdownState, setDropdownState] = React.useState<DropdownState>({
    currentPage: 0
  });
  const [dropdownStateLowCalory, setDropdownStateLowCalory] =
    React.useState<DropdownState>({
      currentPage: 0
    });
  const [allMeals, setAllMeals] = React.useState<NutrientMeal[] | []>([]);
  const [leastCalorieFoods, setLeastCalorieFoods] = React.useState<
    NutrientMeal[] | []
  >([]);
  const totalPages = Math.ceil(allMeals.length / ITEMS_PER_PAGE);

  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  // Данни за диаграмите
  const barChartLabels = allMeals
    .slice(0, 10)
    .map((_, index) => `#${index + 1}`);

  const barChartForTopCalorieFoods = allMeals
    .slice(0, 10)
    .map((meal, index) => allMeals[index].totals.calories);

  const barChartForLowCalorieFoods = allMeals
    .slice()
    .sort((a, b) => a.totals.calories - b.totals.calories)
    .slice(0, 10)
    .map((meal) => meal.totals.calories);
  // useEffect за дърпане на данните от нашето API. Първо се дърпат първите 50 за да се минимизира зареждането на страницата
  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        console.log("Fetching first 50 calorie meals...");
        const first50CalorieMealsPromise =
          getFirst50TopMealsByCollection("topCalorieMeals");
        const first50CalorieMeals = await first50CalorieMealsPromise;

        console.log("First 50 Calorie Meals: ", first50CalorieMeals);

        setAllMeals(first50CalorieMeals as NutrientMeal[]);

        const initialLowCalorieMeals = first50CalorieMeals
          .slice()
          .sort(
            (a: NutrientMeal, b: NutrientMeal) =>
              (a.totals.calories || 0) - (b.totals.calories || 0)
          );

        setLeastCalorieFoods(initialLowCalorieMeals);

        setLoading(false);

        console.log("Fetching remaining calorie meals...");
        getFirstAndLastTopMealsByCollection("topCalorieMeals").then(
          (allCalorieMeals) => {
            console.log("All Calorie Meals: ", allCalorieMeals);
            setAllMeals(allCalorieMeals as NutrientMeal[]);
            const lowCalorieMeals = allCalorieMeals
              .slice()
              .sort(
                (a: NutrientMeal, b: NutrientMeal) =>
                  (a.totals.calories || 0) - (b.totals.calories || 0)
              );

            setLeastCalorieFoods(lowCalorieMeals);
            console.log("FETCHED!");
          }
        );
      } catch (error) {
        console.error("Error fetching calorie data:", error);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);
  // State за първия дропдаун
  const [dropdownVisible, setDropdownVisible] = React.useState(true);
  const handleDropdownToggle = () => {
    setDropdownVisible(!dropdownVisible);
  };
  // State за втория дропдаун
  const [dropdownVisibleLowCalory, setDropdownVisibleLowCalory] =
    React.useState(true);
  const handleDropdownToggleLowCalory = () => {
    setDropdownVisibleLowCalory(!dropdownVisibleLowCalory);
  };
  // Анимация за компонентите под дропдауна при негово движение.
  const slideAnimation = useSpring({
    transform: `translateY(${
      dropdownVisible || dropdownVisibleLowCalory ? -50 : -20
    }px)`,
    config: {
      tension: dropdownVisible ? 170 : 200,
      friction: dropdownVisible ? 12 : 20
    }
  });

  const mealsToShow = allMeals.slice(
    dropdownState.currentPage * ITEMS_PER_PAGE,
    (dropdownState.currentPage + 1) * ITEMS_PER_PAGE
  );

  const mealsToShowLowCalory = leastCalorieFoods.slice(
    dropdownStateLowCalory.currentPage * ITEMS_PER_PAGE,
    (dropdownStateLowCalory.currentPage + 1) * ITEMS_PER_PAGE
  );

  const [isPhoneScreen] = useMediaQuery("(max-width: 767px)");

  return (
    <FadeInWrapper>
      <Box pt={{ base: "160px", md: "80px", xl: "80px" }}>
        <Flex
          flexDirection="column"
          gridArea={{ xl: "1 / 3 / 2 / 4", "2xl": "1 / 2 / 2 / 3" }}
        >
          <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap="20px" mt="20px">
            <Box mb={!dropdownVisible && "20px"}>
              <Dropdown
                title="Най-калорични храни от NutriFit!"
                dropdownVisible={dropdownVisible}
                handleDropdownToggle={handleDropdownToggle}
                titleBg={dropdownVisible ? dropdownBoxBg : dropdownBoxBg}
                titleBorderColour={borderColor}
              >
                {loading ? (
                  <Flex justify="center" align="center" minH="400px">
                    <Loading />
                  </Flex>
                ) : (
                  <Box mt="40px" mb="10px">
                    {mealsToShow.map((meal: NutrientMeal, index: number) => {
                      return (
                        <LeaderBoardItemSmall
                          key={index}
                          name={meal.name}
                          instructions={meal?.instructions}
                          image={meal?.image}
                          ingredients={meal?.ingredients}
                          totals={meal?.totals}
                          topMeals={allMeals}
                          keepOpen={meal === allMeals[0] ? true : false}
                          type="Калории"
                        />
                      );
                    })}
                    <Flex justify="center" mt="40px">
                      <IconButton
                        aria-label="Previous page"
                        icon={<MdKeyboardArrowLeft />}
                        onClick={() =>
                          setDropdownState((prevState) => ({
                            ...prevState,
                            currentPage: Math.max(0, prevState.currentPage - 1)
                          }))
                        }
                        disabled={dropdownState.currentPage === 0}
                        variant="unstyled"
                        _hover={{ bg: "none" }}
                        boxSize={8}
                      />
                      <Text mt="1px" mr="15px" fontSize="xl">
                        <b>{`Страница ${
                          dropdownState.currentPage + 1
                        } от ${totalPages}`}</b>
                      </Text>
                      <IconButton
                        aria-label="Next page"
                        icon={<MdKeyboardArrowRight />}
                        onClick={() =>
                          setDropdownState((prevState) => ({
                            ...prevState,
                            currentPage: Math.min(
                              prevState.currentPage + 1,
                              totalPages - 1
                            )
                          }))
                        }
                        ml="10px"
                        disabled={dropdownState.currentPage === totalPages - 1}
                        variant="unstyled"
                        _hover={{ bg: "none" }}
                        boxSize={8} // Adjust the box size to match the text size
                      />
                    </Flex>
                  </Box>
                )}
              </Dropdown>
            </Box>
            <Box mb={!dropdownVisibleLowCalory && "20px"}>
              <Dropdown
                title="Най-ниско калорични храни от NutriFit!"
                dropdownVisible={dropdownVisibleLowCalory}
                handleDropdownToggle={handleDropdownToggleLowCalory}
                titleBg={
                  dropdownVisibleLowCalory ? dropdownBoxBg : dropdownBoxBg
                }
                titleBorderColour={borderColor}
              >
                {loading ? (
                  <Flex justify="center" align="center" minH="400px">
                    <Loading />
                  </Flex>
                ) : (
                  <Box mt="40px" mb="10px">
                    {mealsToShowLowCalory.map(
                      (meal: NutrientMeal, index: number) => {
                        return (
                          <LeaderBoardItemSmall
                            key={index}
                            name={meal.name}
                            instructions={meal?.instructions}
                            image={meal?.image}
                            ingredients={meal?.ingredients}
                            totals={meal?.totals}
                            topMeals={leastCalorieFoods}
                            keepOpen={
                              meal === leastCalorieFoods[0] ? true : false
                            }
                            type="Калории"
                          />
                        );
                      }
                    )}
                    <Flex justify="center" mt="40px">
                      <IconButton
                        aria-label="Previous page"
                        icon={<MdKeyboardArrowLeft />}
                        onClick={() =>
                          setDropdownStateLowCalory((prevState) => ({
                            ...prevState,
                            currentPage: Math.max(0, prevState.currentPage - 1)
                          }))
                        }
                        disabled={dropdownStateLowCalory.currentPage === 0}
                        variant="unstyled"
                        _hover={{ bg: "none" }}
                        boxSize={8}
                      />
                      <Text mt="1px" mr="15px" fontSize="xl">
                        <b>{`Страница ${
                          dropdownStateLowCalory.currentPage + 1
                        } от ${totalPages}`}</b>
                      </Text>
                      <IconButton
                        aria-label="Next page"
                        icon={<MdKeyboardArrowRight />}
                        onClick={() =>
                          setDropdownStateLowCalory((prevState) => ({
                            ...prevState,
                            currentPage: Math.min(
                              prevState.currentPage + 1,
                              totalPages - 1
                            )
                          }))
                        }
                        ml="10px"
                        disabled={
                          dropdownStateLowCalory.currentPage === totalPages - 1
                        }
                        variant="unstyled"
                        _hover={{ bg: "none" }}
                        boxSize={8} // Adjust the box size to match the text size
                      />
                    </Flex>
                  </Box>
                )}
              </Dropdown>
            </Box>
          </SimpleGrid>
          <animated.div style={{ ...slideAnimation, position: "relative" }}>
            <SimpleGrid
              columns={{ base: 1, md: 2, xl: 2 }}
              gap="20px"
              mt="20px"
            >
              <Card
                fontSize="3xl"
                maxH={{ sm: "200px", md: "200px", lg: "150px" }}
                p="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                borderColor={borderColor}
                borderWidth="3px"
              >
                Сравнение на първите 10 най-калорични храни от NutriFit!
              </Card>
              {!isPhoneScreen && (
                <Card
                  fontSize="3xl"
                  maxH={{ sm: "200px", md: "200px", lg: "150px" }}
                  p="20px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  borderColor={borderColor}
                  borderWidth="3px"
                >
                  Сравнение на първите 10 най-ниско калорични храни от NutriFit!
                </Card>
              )}
              <Card
                alignItems="center"
                flexDirection="column"
                h="100%"
                w="100%"
                minH={{ sm: "400px", md: "300px", lg: "auto" }}
                minW={{ sm: "150px", md: "200px", lg: "auto" }}
                borderColor={borderColor}
                borderWidth="3px"
              >
                {loading ? (
                  <Flex justify="center" align="center" minH="200px">
                    <Loading />
                  </Flex>
                ) : (
                  <ColumnChart
                    chartLabels={barChartLabels}
                    chartData={barChartForTopCalorieFoods}
                    chartLabelName="Сравнение на най-калорични храни (kcal)"
                    textColor={chartsColor}
                    color="#472ffb"
                  />
                )}
              </Card>
              {isPhoneScreen && (
                <Card
                  fontSize="3xl"
                  maxH={{ sm: "200px", md: "200px", lg: "150px" }}
                  p="20px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  borderColor={borderColor}
                  borderWidth="3px"
                >
                  Сравнение на първите 10 най-ниско калорични храни от NutriFit!
                </Card>
              )}
              <Card
                alignItems="center"
                flexDirection="column"
                h="100%"
                w="100%"
                minH={{ sm: "400px", md: "300px", lg: "auto" }}
                minW={{ sm: "150px", md: "200px", lg: "auto" }}
                borderColor={borderColor}
                borderWidth="3px"
              >
                {loading ? (
                  <Flex justify="center" align="center" minH="200px">
                    <Loading />
                  </Flex>
                ) : (
                  <ColumnChart
                    chartLabels={barChartLabels}
                    chartData={barChartForLowCalorieFoods}
                    chartLabelName="Сравнение на най-ниско калорични храни (kcal)"
                    textColor={chartsColor}
                    color="#472ffb"
                  />
                )}
              </Card>
            </SimpleGrid>
          </animated.div>
        </Flex>
      </Box>
    </FadeInWrapper>
  );
}
