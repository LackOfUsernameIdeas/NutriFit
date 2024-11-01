import React from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  useColorModeValue,
  Text,
  IconButton
} from "@chakra-ui/react";
import FadeInWrapper from "components/wrapper/FadeInWrapper";
import Loading from "views/admin/weightStats/components/Loading";
import LeaderboardItem from "./components/LeaderboardItem";
import Card from "components/card/Card";
import { useSpring, animated } from "react-spring";
import { ColumnChart } from "components/charts/BarCharts";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { SuggestedMeal } from "../../../variables/weightStats";
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
  const defaultMealData = {
    totals: {
      calories: 424,
      carbohydrates: 2135432,
      grams: 1233412,
      fat: 124,
      protein: 124
    },
    recipeQuantity: 235,
    image:
      "https://recepti.gotvach.bg/files/lib/250x250/vitaminozna-salata-pecheni-orehi.webp",
    ingredients: ["wfwfwf", "fgwfwfwf"],
    name: "string",
    instructions: ["wfwfwf", "fgwfwfwf"]
  };

  // State за всички ястия
  const [allMeals, setAllMeals] = React.useState<SuggestedMeal[]>([
    { name: "Tova", count: 2, mealData: defaultMealData },
    { name: "Tova", count: 1, mealData: defaultMealData },
    { name: "Tova", count: 1, mealData: defaultMealData },
    { name: "Tova", count: 1, mealData: defaultMealData },
    { name: "Tova", count: 1, mealData: defaultMealData }
  ]);
  const totalPages = Math.ceil(allMeals.length / ITEMS_PER_PAGE);

  // Данни за диаграма
  const barChartLabels = allMeals
    .slice(0, 10)
    .map((_, index) => `#${index + 1}`);
  const barChartForTopSuggestions = allMeals
    .slice(0, 10)
    .map((entry) => entry.count);

  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  // useEffect за fetch-ване на всички храни от нашето API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://nutri-api.noit.eu/orderedMeals", {
          headers: {
            "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const orderedMeals = await response.json();

        console.log("Sorted meals by frequency:", orderedMeals);
        setAllMeals(orderedMeals);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching meals:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [dropdownVisible, setDropdownVisible] = React.useState(true);

  const handleDropdownToggle = () => {
    setDropdownVisible(!dropdownVisible);
  };
  // Анимация за компонентите под дропдауна при негово движение.
  const slideAnimation = useSpring({
    transform: `translateY(${dropdownVisible ? 0 : 0}px)`,
    config: {
      tension: dropdownVisible ? 170 : 200,
      friction: dropdownVisible ? 12 : 20
    }
  });

  const mealsToShow = allMeals.slice(
    dropdownState.currentPage * ITEMS_PER_PAGE,
    (dropdownState.currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <FadeInWrapper>
      <Box pt={{ base: "160px", md: "80px", xl: "80px" }}>
        {loading ? (
          <Box mt="37vh" minH="600px" opacity={loading ? 1 : 0}>
            <Loading />
          </Box>
        ) : (
          <Flex
            flexDirection="column"
            gridArea={{ xl: "1 / 3 / 2 / 4", "2xl": "1 / 2 / 2 / 3" }}
          >
            <Card p="0px">
              <Dropdown
                title="Най-препоръчани храни от NutriFit!"
                dropdownVisible={dropdownVisible}
                handleDropdownToggle={handleDropdownToggle}
                titleBg={dropdownVisible ? dropdownBoxBg : dropdownBoxBg}
                titleBorderColour={borderColor}
              >
                {mealsToShow.map((meal: SuggestedMeal, index: number) => {
                  return (
                    <LeaderboardItem
                      key={index}
                      name={meal.name}
                      count={"Брой препоръчвания: " + meal.count.toString()}
                      instructions={meal?.mealData.instructions}
                      image={meal?.mealData.image}
                      ingredients={meal?.mealData.ingredients}
                      totals={meal?.mealData.totals}
                      topMeals={allMeals}
                      keepOpen={meal === allMeals[0] ? true : false}
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
              </Dropdown>
            </Card>
            <animated.div style={{ ...slideAnimation, position: "relative" }}>
              <SimpleGrid
                columns={{ base: 1, md: 1, xl: 1 }}
                gap="20px"
                mt="20px"
              >
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
                  Сравнение на първите 10 най-препоръчани храни от NutriFit!
                </Card>
              </SimpleGrid>
              <SimpleGrid
                columns={{ base: 1, md: 1, xl: 1 }}
                gap="20px"
                mt="20px"
                mb="20px"
              >
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
                  <ColumnChart
                    chartLabels={barChartLabels}
                    chartData={barChartForTopSuggestions}
                    chartLabelName="Сравнение на препоръчани храни"
                    textColor={chartsColor}
                    color="#472ffb"
                  />
                </Card>
              </SimpleGrid>
            </animated.div>
          </Flex>
        )}
      </Box>
    </FadeInWrapper>
  );
}
