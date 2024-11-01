import React from "react";
import {
  Box,
  Flex,
  Icon,
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
  const [dropdownStateLowFat, setDropdownStateLowFat] =
    React.useState<DropdownState>({
      currentPage: 0
    });
  const [allMeals, setAllMeals] = React.useState<NutrientMeal[] | []>([]);
  const [leastFatFoods, setLeastFatFoods] = React.useState<NutrientMeal[] | []>(
    []
  );
  const totalPages = Math.ceil(allMeals.length / ITEMS_PER_PAGE);
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const barChartLabels = allMeals
    .slice(0, 10)
    .map((_, index) => `#${index + 1}`);

  const barChartForTopFatFoods = allMeals
    .slice(0, 10)
    .map((meal, index) => allMeals[index].totals.fat);
  // useEffect за дърпане на данните от нашето API. Първо се дърпат първите 50 за да се минимизира зареждането на страницата
  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        console.log("Fetching first 50 fat meals...");
        const first50FatMealsPromise =
          getFirst50TopMealsByCollection("topFatMeals");
        const first50FatMeals = await first50FatMealsPromise;

        console.log("First 50 Fat Meals: ", first50FatMeals);

        // Display the first 50 fat meals
        setAllMeals(first50FatMeals as NutrientMeal[]);

        const initialLowFatMeals = first50FatMeals
          .slice()
          .sort(
            (a: NutrientMeal, b: NutrientMeal) =>
              (a.totals.fat || 0) - (b.totals.fat || 0)
          );

        setLeastFatFoods(initialLowFatMeals);

        setLoading(false);

        console.log("Fetching remaining fat meals...");
        getFirstAndLastTopMealsByCollection("topFatMeals").then(
          (allFatMeals) => {
            console.log("All Fat Meals: ", allFatMeals);
            setAllMeals(allFatMeals as NutrientMeal[]);
            const lowFatMeals = allFatMeals
              .slice()
              .sort(
                (a: NutrientMeal, b: NutrientMeal) =>
                  (a.totals.fat || 0) - (b.totals.fat || 0)
              );

            setLeastFatFoods(lowFatMeals);
            console.log("FETCHED!");
          }
        );
      } catch (error) {
        console.error("Error fetching fat data:", error);
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
  // State за първия дропдаун
  const [dropdownVisibleLowFat, setDropdownVisibleLowFat] =
    React.useState(true);

  const handleDropdownToggle = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleDropdownToggleLowFat = () => {
    setDropdownVisibleLowFat(!dropdownVisibleLowFat);
  };
  // Анимация за компонентите под дропдауна при негово движение.
  const slideAnimation = useSpring({
    transform: `translateY(${
      dropdownVisible || dropdownVisibleLowFat ? -50 : -20
    }px)`,
    config: {
      tension: dropdownVisible || dropdownVisibleLowFat ? 170 : 200,
      friction: dropdownVisible || dropdownVisibleLowFat ? 12 : 20
    }
  });

  const mealsToShow = allMeals.slice(
    dropdownState.currentPage * ITEMS_PER_PAGE,
    (dropdownState.currentPage + 1) * ITEMS_PER_PAGE
  );

  const leastFatMealsToShow = leastFatFoods.slice(
    dropdownStateLowFat.currentPage * ITEMS_PER_PAGE,
    (dropdownStateLowFat.currentPage + 1) * ITEMS_PER_PAGE
  );

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
                title="Най-богати на мазнини храни от NutriFit!"
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
                          type="Мазнини"
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
            <Box mb={!dropdownVisibleLowFat && "20px"}>
              <Dropdown
                title="Най-бедни на мазнини храни от NutriFit!"
                dropdownVisible={dropdownVisibleLowFat}
                handleDropdownToggle={handleDropdownToggleLowFat}
                titleBg={dropdownVisibleLowFat ? dropdownBoxBg : dropdownBoxBg}
                titleBorderColour={borderColor}
              >
                {loading ? (
                  <Flex justify="center" align="center" minH="400px">
                    <Loading />
                  </Flex>
                ) : (
                  <Box mt="40px" mb="10px">
                    {leastFatMealsToShow.map(
                      (meal: NutrientMeal, index: number) => {
                        return (
                          <LeaderBoardItemSmall
                            key={index}
                            name={meal.name}
                            instructions={meal?.instructions}
                            image={meal?.image}
                            ingredients={meal?.ingredients}
                            totals={meal?.totals}
                            topMeals={leastFatFoods}
                            keepOpen={meal === leastFatFoods[0] ? true : false}
                            type="Мазнини"
                          />
                        );
                      }
                    )}
                    <Flex justify="center" mt="40px">
                      <IconButton
                        aria-label="Previous page"
                        icon={<MdKeyboardArrowLeft />}
                        onClick={() =>
                          setDropdownStateLowFat((prevState) => ({
                            ...prevState,
                            currentPage: Math.max(0, prevState.currentPage - 1)
                          }))
                        }
                        disabled={dropdownStateLowFat.currentPage === 0}
                        variant="unstyled"
                        _hover={{ bg: "none" }}
                        boxSize={8}
                      />
                      <Text mt="1px" mr="15px" fontSize="xl">
                        <b>{`Страница ${
                          dropdownStateLowFat.currentPage + 1
                        } от ${totalPages}`}</b>
                      </Text>
                      <IconButton
                        aria-label="Next page"
                        icon={<MdKeyboardArrowRight />}
                        onClick={() =>
                          setDropdownStateLowFat((prevState) => ({
                            ...prevState,
                            currentPage: Math.min(
                              prevState.currentPage + 1,
                              totalPages - 1
                            )
                          }))
                        }
                        ml="10px"
                        disabled={
                          dropdownStateLowFat.currentPage === totalPages - 1
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
            <SimpleGrid columns={1} gap="20px" mt="20px">
              <Card
                fontSize="3xl"
                maxH={{ sm: "200px", md: "150px", lg: "150px" }}
                p="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                borderColor={borderColor}
                borderWidth="3px"
              >
                Сравнение на първите 10 най-богати на мазнини храни от NutriFit!
                (g.)
              </Card>
            </SimpleGrid>
            <SimpleGrid columns={1} gap="20px" mt="20px">
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
                    chartData={barChartForTopFatFoods}
                    chartLabelName="Сравнение на най-богатите на мазнини храни (g.)"
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
