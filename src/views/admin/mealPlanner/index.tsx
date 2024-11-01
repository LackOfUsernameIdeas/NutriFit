import React, { useState } from "react";

// Chakra UI components
import {
  Box,
  Flex,
  Text,
  Button,
  SimpleGrid,
  useColorModeValue,
  useMediaQuery
} from "@chakra-ui/react";
import FadeInWrapper from "components/wrapper/FadeInWrapper";
import Card from "components/card/Card";
import { useSpring, animated } from "react-spring";
import DietTable from "../../../components/table/ColumnsTable";
import CalorieRequirements from "./components/CalorieRequirements";
import Loading from "views/admin/weightStats/components/Loading";
import MealPlannerForm from "./components/MealPlannerForm";
import {
  UserData,
  UserIntakes,
  AllUsersPreferences,
  DailyCaloryRequirements,
  WeightDifference
} from "../../../variables/weightStats";
import { getAuth } from "firebase/auth";
import { savePreferences } from "../../../database/setFunctions";
import { parseISO } from "date-fns";
import UserInfoCard from "components/infoCard/userInfoCard";
import AlertBox from "components/alert/alert";
import InfoBox from "components/infoBox/infoBox";
import NutrientsDropdown from "./components/NutrientsDropdown";
import AlertDropdown from "./components/AlertDropdown";

// Главен компонент
export default function MealPlanner() {
  const bgButton = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const gradientLight = "linear-gradient(90deg, #422afb 0%, #715ffa 50%)";
  const gradientDark = "linear-gradient(90deg, #715ffa 0%, #422afb 100%)";
  const gradient = useColorModeValue(gradientLight, gradientDark);
  const textColor = useColorModeValue("black", "white");
  const gradientHover = useColorModeValue(
    { bg: "linear-gradient(90deg, #4f3efb 0%, #8477fa 50%)" },
    { bg: "linear-gradient(90deg, #7e6afc 0%, #4f3efb 100%)" }
  );
  const bgHover = useColorModeValue(
    { bg: "secondaryGray.400" },
    { bg: "whiteAlpha.100" }
  );

  const [dailyCaloryRequirements, setDailyCaloryRequirements] = useState<
    DailyCaloryRequirements[]
  >(
    Array.from({ length: 6 }, (_, index) => ({
      level: index + 1,
      BMR: 0,
      goals: {
        "maintain weight": 0,
        "Mild weight loss": { "loss weight": "0", calory: 0 },
        "Weight loss": { "loss weight": "0", calory: 0 },
        "Extreme weight loss": { "loss weight": "0", calory: 0 },
        "Mild weight gain": { "gain weight": "0", calory: 0 },
        "Weight gain": { "gain weight": "0", calory: 0 },
        "Extreme weight gain": { "gain weight": "0", calory: 0 }
      }
    }))
  );

  const [macroNutrients, setMacroNutrients] = useState<any>([]);

  // State за избрани стойности
  const [clickedValueNutrients, setClickedValueNutrients] = useState({
    name: "",
    protein: null,
    fat: null,
    carbs: null
  });

  const [clickedValueCalories, setClickedValueCalories] = useState<
    number | null
  >(null);

  const [userIntakes, setUserIntakes] = useState<UserIntakes>({
    Calories: 0,
    Protein: 0,
    Fat: 0,
    Carbohydrates: 0
  });

  const [selectedGoal, setSelectedGoal] = useState("");

  // State за избрано ниво на натовареност
  const [activityLevel, setActivityLevel] = useState<number>(null);
  const [isDietTableDataReady, setIsDietTableDataReady] = useState(false);
  // State за зареждане на страницата

  const [userData, setUserData] = useState<UserData>({
    gender: "male" || "female",
    height: 0,
    age: 0,
    weight: 0,
    neck: 0,
    waist: 0,
    hip: 0,
    goal: "maintain"
  });

  const [allUsersPreferences, setAllUsersPreferences] = useState<
    AllUsersPreferences[]
  >([
    {
      date: "",
      Calories: 0,
      Protein: 0,
      Fat: 0,
      Carbohydrates: 0,
      Diet: ""
    }
  ]);
  allUsersPreferences.sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );
  const [allOrderedObjects, setAllOrderedObjects] = useState([
    {
      date: "",
      height: 0,
      weight: 0,
      bmi: 0,
      bodyFat: 0,
      bodyFatMass: 0,
      leanBodyMass: 0,
      differenceFromPerfectWeight: { difference: 0, isUnderOrAbove: "" }
    }
  ]);
  allOrderedObjects.sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );
  const [
    differenceFromPerfectWeightChange,
    setDifferenceFromPerfectWeightChange
  ] = useState<number | null>(null);

  const [perfectWeight, setPerfectWeight] = useState<number>(0);
  const [differenceFromPerfectWeight, setDifferenceFromPerfectWeight] =
    useState<WeightDifference>({
      difference: 0,
      isUnderOrAbove: ""
    });
  // Функция, която определя дали потребителя има нужда да сваля, запазва или качва кг.
  function calculateRecommendedGoal() {
    const difference = differenceFromPerfectWeight.difference;
    const underOrAbove = differenceFromPerfectWeight.isUnderOrAbove;

    let recommendedGoal;

    if (Math.abs(difference) < 2) {
      recommendedGoal = "Запазите";
    } else if (underOrAbove === "under" && Math.abs(difference) >= 2) {
      recommendedGoal = "Качвате";
    } else if (underOrAbove === "above" && Math.abs(difference) >= 2) {
      recommendedGoal = "Сваляте";
    }

    return recommendedGoal;
  }
  const [health, setHealth] = useState("");
  const [userDataLastSavedDate, setUserDataLastSavedDate] = useState("");

  const [
    isGenerateStatsForCaloriesCalled,
    setIsGenerateStatsForCaloriesCalled
  ] = useState<boolean>(false);

  const [
    isGenerateStatsForMacroNutrientsCalled,
    setIsGenerateStatsForMacroNutrientsCalled
  ] = useState<boolean>(false);
  // Функция за генериране на статистики
  function generateStatsForCalories() {
    setTimeout(() => {}, 1000);
  }

  function generateStatsForMacroNutrients() {
    setTimeout(() => {
      setIsDietTableDataReady(true);
    }, 1000);
  }
  // Функции, които калкулират изменението на стойностите на потребителя
  const calculateChange = (sortedData: any[], property: string) => {
    const latestValue = sortedData[0][property];
    const previousValue = sortedData[1][property];
    const change = latestValue - previousValue;
    console.log("latestValue", latestValue);
    console.log("previousValue", previousValue);
    setUserDataLastSavedDate(sortedData[1].date);
    console.log("change", change);
    return change;
  };

  const calculatePerfectWeightChange = () => {
    // Create an object to store unique entries based on date
    const uniqueEntries: { [date: string]: any } = {};

    // Iterate over userDataForCharts to find the unique entries
    allOrderedObjects.forEach((entry) => {
      if (entry.differenceFromPerfectWeight && !uniqueEntries[entry.date]) {
        uniqueEntries[entry.date] = {
          differenceFromPerfectWeight: entry.differenceFromPerfectWeight
        };
      }
    });

    // Create an array of entries sorted by date
    const sortedData = Object.entries(uniqueEntries)
      .sort((a, b) => parseISO(b[0]).getTime() - parseISO(a[0]).getTime())
      .map(([date, values]) => ({ date, ...values }));

    if (sortedData.length >= 2) {
      const differenceFromPerfectWeightChange = calculateChange(
        sortedData,
        "differenceFromPerfectWeight"
      );
      setDifferenceFromPerfectWeightChange(differenceFromPerfectWeightChange);

      console.log("the last two entries for BMI222222: ", sortedData);
      console.log(
        "differenceFromPerfectWeightChange changes: ",
        differenceFromPerfectWeightChange
      );
    }
  };

  React.useEffect(() => {
    calculatePerfectWeightChange();
  }, [allOrderedObjects]);

  const saveUserPreferencesAndIntakes = () => {
    const uid = getAuth().currentUser.uid;
    savePreferences(uid, clickedValueCalories, clickedValueNutrients);
  };
  // Данни за диаграмите
  const lineChartLabels = allUsersPreferences.map((entry) => entry.date);
  const lineChartForCalories = allUsersPreferences.map(
    (entry) => entry.Calories
  );
  const lineChartForProtein = allUsersPreferences.map((entry) => entry.Protein);
  const lineChartForFat = allUsersPreferences.map((entry) => entry.Fat);
  const lineChartForCarbs = allUsersPreferences.map(
    (entry) => entry.Carbohydrates
  );
  // Стейтове и функции за дропдауните
  const [dropdownVisible, setDropdownVisible] = React.useState(false);
  const [dropdownVisibleTip, setDropdownVisibleTip] = React.useState(false);

  const handleDropdownToggle = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleDropdownTipToggle = () => {
    setDropdownVisibleTip(!dropdownVisibleTip);
  };
  // Анимации за компонентите под дропдауните при движението им
  const slideAnimation = useSpring({
    transform: `translateY(${dropdownVisible ? -50 : 0}px)`,
    config: {
      tension: dropdownVisible ? 170 : 200,
      friction: dropdownVisible ? 12 : 20
    }
  });

  const slideAnimationTip = useSpring({
    transform: `translateY(${dropdownVisibleTip ? -30 : 0}px)`,
    config: {
      tension: dropdownVisibleTip ? 170 : 200,
      friction: dropdownVisibleTip ? 12 : 20
    }
  });

  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    // Слуша промените в състоянието на аутентикация и актуализира текущия потребител.
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, []);

  React.useEffect(() => {
    // Извлича данни за потребителя, ако текущият потребител е зададен.
    if (currentUser) {
      const fetchData = async () => {
        try {
          const uid = currentUser.uid;
          const date = new Date().toISOString().slice(0, 10);
          const response = await fetch(
            "https://nutri-api.noit.eu/weightStatsAndMealPlanner",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
              },
              body: JSON.stringify({
                uid: uid,
                date: date
              })
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch weight stats");
          }

          const weightStatsData = await response.json();

          setUserData({
            gender: weightStatsData.userDataSaveable.gender,
            goal: weightStatsData.userDataSaveable.goal,
            age: weightStatsData.userDataSaveable.age,
            height: weightStatsData.userDataSaveable.height,
            waist: weightStatsData.userDataSaveable.waist,
            neck: weightStatsData.userDataSaveable.neck,
            hip: weightStatsData.userDataSaveable.hip,
            weight: weightStatsData.userDataSaveable.weight
          });
          console.log("weight stats", weightStatsData);
          setPerfectWeight(weightStatsData.perfectWeight);
          console.log(
            "DIFFERENCE FROM FETCH!!!! ",
            weightStatsData.differenceFromPerfectWeight
          );
          setDifferenceFromPerfectWeight({
            difference:
              weightStatsData?.differenceFromPerfectWeight?.difference || 0,
            isUnderOrAbove:
              weightStatsData?.differenceFromPerfectWeight?.isUnderOrAbove || ""
          });

          setHealth(weightStatsData.bmiIndex.health);

          setAllOrderedObjects(weightStatsData.userDataForCharts);
          const preferencesObjects =
            weightStatsData.orderedTimestampObjectsWithPreferences.map(
              (timestampObject: any) => ({
                date: timestampObject.date,
                ...timestampObject.Preferences
              })
            );
          console.log("preferencesObjects: ", preferencesObjects);
          setAllUsersPreferences(preferencesObjects);
          setDailyCaloryRequirements(weightStatsData.dailyCaloryRequirements);
          setMacroNutrients(weightStatsData.macroNutrientsData);
        } catch (error) {
          console.error("Error fetching weight stats:", error);
        }
      };

      fetchData();
    }
  }, [currentUser]);

  React.useEffect(() => {
    // Проверява дали всички стойности на потребителските данни са валидни и генерира статистика за калориите.
    const areValuesValid = Object.values(userData).every(
      (value) => value !== 0
    );

    if (areValuesValid) {
      generateStatsForCalories();
      setIsGenerateStatsForCaloriesCalled(true);
    }
  }, [userData]);

  React.useEffect(() => {
    // Генерира статистика за макронутриентите, ако статистиката за калориите е генерирана и целта на потребителя е зададена.
    if (isGenerateStatsForCaloriesCalled && userData.goal) {
      generateStatsForMacroNutrients();
      setIsGenerateStatsForMacroNutrientsCalled(true);
    }
  }, [isGenerateStatsForCaloriesCalled, userData.goal]);

  let tableData: any = [];
  if (macroNutrients[activityLevel - 1]) {
    macroNutrients[activityLevel - 1].goals.forEach((item: any) => {
      const { goal, calorie, balanced, highprotein, lowcarbs, lowfat } = item;

      if (goal === selectedGoal) {
        const savedData = [
          {
            name: "Балансирана",
            protein: balanced.protein.toFixed(2),
            fat: balanced.fat.toFixed(2),
            carbs: balanced.carbs.toFixed(2)
          },
          {
            name: "Ниско съдържание на мазнини",
            protein: lowfat.protein.toFixed(2),
            fat: lowfat.fat.toFixed(2),
            carbs: lowfat.carbs.toFixed(2)
          },
          {
            name: "Ниско съдържание на въглехидрати",
            protein: lowcarbs.protein.toFixed(2),
            fat: lowcarbs.fat.toFixed(2),
            carbs: lowcarbs.carbs.toFixed(2)
          },
          {
            name: "Високо съдържание на Протеин",
            protein: highprotein.protein.toFixed(2),
            fat: highprotein.fat.toFixed(2),
            carbs: highprotein.carbs.toFixed(2)
          }
        ];

        tableData = savedData;
      }
    });
  }

  React.useEffect(() => {
    if (
      clickedValueCalories !== null &&
      clickedValueNutrients.protein !== null
    ) {
      saveUserPreferencesAndIntakes();
    }
  }, [clickedValueCalories, clickedValueNutrients]);

  console.log("userIntakes: ", userIntakes);

  const [isSmallScreen] = useMediaQuery("(max-width: 767px)");

  return (
    <FadeInWrapper>
      <Box
        pt={{ base: "130px", md: "80px", xl: "80px" }}
        style={{ overflow: "hidden" }}
      >
        <Box>
          {!isGenerateStatsForCaloriesCalled ? (
            <Box
              mt="37vh"
              minH="600px"
              opacity={!isGenerateStatsForCaloriesCalled ? 1 : 0}
            >
              <Loading />
            </Box>
          ) : (
            <Box transition="0.2s ease-in-out">
              <UserInfoCard userData={userData} />

              <AlertDropdown
                userDataLastSavedDate={userDataLastSavedDate}
                differenceFromPerfectWeight={differenceFromPerfectWeight}
                differenceFromPerfectWeightChange={
                  differenceFromPerfectWeightChange
                }
                perfectWeight={perfectWeight}
                health={health}
                dropdownVisible={dropdownVisibleTip}
                handleDropdownToggle={handleDropdownTipToggle}
                calculateRecommendedGoal={calculateRecommendedGoal}
              />

              <animated.div
                style={{ ...slideAnimationTip, position: "relative" }}
              >
                {lineChartForCalories.length > 1 && (
                  <NutrientsDropdown
                    lineChartForCalories={lineChartForCalories}
                    lineChartForCarbs={lineChartForCarbs}
                    lineChartForFat={lineChartForFat}
                    lineChartForProtein={lineChartForProtein}
                    lineChartLabels={lineChartLabels}
                    handleDropdownToggle={handleDropdownToggle}
                    dropdownVisible={dropdownVisible}
                  />
                )}
                <animated.div
                  style={{ ...slideAnimation, position: "relative" }}
                >
                  <Card
                    alignItems="center"
                    p="20px"
                    flexDirection="column"
                    w="100%"
                    mt="20px"
                    mb="20px"
                  >
                    {isSmallScreen ? (
                      <>
                        <Flex direction="column" alignItems="center">
                          <Text
                            color={textColor}
                            fontSize="2xl"
                            ms="24px"
                            fontWeight="700"
                            whiteSpace="normal"
                            textAlign="center"
                          >
                            Изберете ниво на натовареност:
                          </Text>
                          <InfoBox
                            buttonText="Нива на натовареност"
                            infoText={[
                              "<b>Ниво 1</b> - Малко или въобще не спортувате. Примерни упражнения: Кратка разходка, Лека Йога, Кратка Тай Чи сесия (20 мин.)",
                              "<b>Ниво 2</b> - Спортувате умерено 1-3 пъти в седмицата. Примерни упражнения: Умерена разходка за 30 мин, Работа в двора/градинарство за 45 мин, Каране на колело за 1 час",
                              "<b>Ниво 3</b> - Спортувате умерено 4-5 пъти в седмицата. Примерни упражнения: Тичане 30 мин, Плуване за 30 мин, Играене на тенис/волейбол за 45 мин.",
                              "<b>Ниво 4</b> - Спортувате умерено дневно или интензивно 3-4 пъти в седмицата. Примерни упражнения: Интервална тренировка с висока интензивност 30 мин, Тренировка за цялото тяло 45 мин. Бързо плуване за 45 минути.",
                              "<b>Ниво 5</b> - Спортувате интензивно 6-7 пъти в седмицата. Примерни упражнения: По-тежка и по-дълга интервална тренировка с висока интензивност, Трениране на Кик-бокс за 1 час, Трениране на бойни изкуства.",
                              "<b>Ниво 6</b> - Спортувате много интензивно цялата седмица. Примерни упражнения: Тренировка за маратон, Каране на колело из дълги растояния за 2 часа, Вдигане на тежести за 1 час, Участвие в спортен турнир (90 мин.)"
                            ]}
                          />
                        </Flex>
                      </>
                    ) : (
                      <>
                        <Flex wrap="nowrap" alignItems="center">
                          <Text
                            color={textColor}
                            fontSize="2xl"
                            fontWeight="700"
                            whiteSpace="nowrap"
                            mr="10px"
                          >
                            Изберете ниво на натовареност:
                          </Text>
                          <InfoBox
                            buttonText="Нива на натовареност"
                            infoText={[
                              "<b>Ниво 1</b> - Малко или въобще не спортувате. Примерни упражнения: Кратка разходка, Лека Йога, Кратка Тай Чи сесия (20 мин.)",
                              "<b>Ниво 2</b> - Спортувате умерено 1-3 пъти в седмицата. Примерни упражнения: Умерена разходка за 30 мин, Работа в двора/градинарство за 45 мин, Каране на колело за 1 час",
                              "<b>Ниво 3</b> - Спортувате умерено 4-5 пъти в седмицата. Примерни упражнения: Тичане 30 мин, Плуване за 30 мин, Играене на тенис/волейбол за 45 мин.",
                              "<b>Ниво 4</b> - Спортувате умерено дневно или интензивно 3-4 пъти в седмицата. Примерни упражнения: Интервална тренировка с висока интензивност 30 мин, Тренировка за цялото тяло 45 мин. Бързо плуване за 45 минути.",
                              "<b>Ниво 5</b> - Спортувате интензивно 6-7 пъти в седмицата. Примерни упражнения: По-тежка и по-дълга интервална тренировка с висока интензивност, Трениране на Кик-бокс за 1 час, Трениране на бойни изкуства.",
                              "<b>Ниво 6</b> - Спортувате много интензивно цялата седмица. Примерни упражнения: Тренировка за маратон, Каране на колело из дълги растояния за 2 часа, Вдигане на тежести за 1 час, Участвие в спортен турнир (90 мин.)"
                            ]}
                          />
                        </Flex>
                      </>
                    )}
                    <Box gap="10px" mb="20px" mt="20px">
                      <Flex justifyContent="space-between" align="center">
                        <SimpleGrid
                          columns={{ base: 3, md: 2, lg: 6 }}
                          spacing="10px"
                          alignItems="center"
                          mb="10px"
                        >
                          {[1, 2, 3, 4, 5, 6].map((level) => (
                            <Button
                              key={level}
                              fontSize={{ base: "sm", md: "md" }}
                              margin="0"
                              color={
                                activityLevel === level ? "white" : textColor
                              }
                              bg={activityLevel === level ? gradient : bgButton}
                              _hover={
                                activityLevel === level
                                  ? gradientHover
                                  : bgHover
                              }
                              transition={
                                activityLevel === level
                                  ? "background 0.3s ease-in-out"
                                  : "background 0.3s ease-in-out, color 0.3s ease-in-out"
                              }
                              onClick={() => setActivityLevel(level)}
                            >
                              Ниво {level}
                            </Button>
                          ))}
                        </SimpleGrid>
                      </Flex>
                    </Box>
                  </Card>
                  {activityLevel && (
                    <Box>
                      {macroNutrients.length > 0 ? (
                        <FadeInWrapper>
                          <FadeInWrapper>
                            <Card
                              p="20px"
                              flexDirection="column"
                              w="100%"
                              mb="20px"
                            >
                              <Card alignItems="center">
                                <Text
                                  color={textColor}
                                  fontSize="2xl"
                                  ms="24px"
                                  fontWeight="700"
                                >
                                  Изберете желаната от вас цел и съответните
                                  калории, които трябва да приемате на ден
                                  според желания резултат:
                                </Text>
                                <CalorieRequirements
                                  calorieRequirements={dailyCaloryRequirements}
                                  selectedActivityLevel={activityLevel}
                                  clickedValueCalories={clickedValueCalories}
                                  setClickedValueCalories={
                                    setClickedValueCalories
                                  }
                                  setSelectedGoal={setSelectedGoal}
                                  setUserData={setUserData}
                                />
                              </Card>
                              {isDietTableDataReady &&
                                clickedValueCalories !== null && (
                                  <FadeInWrapper>
                                    <>
                                      <Flex align="center" gap="1%">
                                        <Text
                                          color={textColor}
                                          fontSize="2xl"
                                          ms="24px"
                                          fontWeight="700"
                                        >
                                          Изберете тип диета:
                                        </Text>
                                        <InfoBox
                                          buttonText="Изберете тип диета според вашите предпочитания:"
                                          infoText={[
                                            "<b>Балансирана:</b><br /> Балансирано разпределение на макронутриенти с умерени нива на протеини, въглехидрати и мазнини. Идеална за поддържане на здравето.",
                                            "<b>Ниско съдържание на мазнини:</b><br /> Набляга на намаляване на приема на мазнини и поддържане на адекватни нива на протеини и въглехидрати. Подходящ за тези, които се стремят да намалят общия прием на калории и да контролират теглото си.",
                                            "<b>Ниско съдържание на въглехидрати:</b><br /> Фокусира се върху минимизиране на приема на въглехидрати, като същевременно осигурява достатъчно протеини и здравословни мазнини.",
                                            "<b>Високо съдържание на протеин:</b><br /> Дава приоритет на по-висок прием на протеин с умерени нива на въглехидрати и мазнини. Идеална за тези, които искат да подпомогнат развитието на мускулите, особено при силови тренировки или фитнес програми."
                                          ]}
                                        />
                                      </Flex>
                                      <DietTable
                                        tableData={tableData}
                                        columnsData={[
                                          { name: "name", label: "Тип диета" },
                                          {
                                            name: "protein",
                                            label: "Протеин (гр.)"
                                          },
                                          {
                                            name: "fat",
                                            label: "Мазнини (гр.)"
                                          },
                                          {
                                            name: "carbs",
                                            label: "Въглехидрати (гр.)"
                                          }
                                        ]}
                                        setState={setClickedValueNutrients}
                                        clickedValueProtein={
                                          clickedValueNutrients.protein
                                        }
                                      />
                                    </>
                                  </FadeInWrapper>
                                )}
                            </Card>
                          </FadeInWrapper>
                          {clickedValueNutrients.protein !== null && (
                            <MealPlannerForm
                              chosenCalories={clickedValueCalories}
                              chosenNutrients={clickedValueNutrients}
                              userIntakes={userIntakes}
                              setUserIntakes={setUserIntakes}
                            />
                          )}
                        </FadeInWrapper>
                      ) : (
                        <Box>
                          <Loading />
                          <br />
                        </Box>
                      )}
                    </Box>
                  )}
                  <AlertBox
                    status="warning"
                    text="Тези стойности са приблизителни и може да е необходимо
                    преценка от диетолог или здравен специалист, за да се
                    адаптират към индивидуалните ви нужди."
                  />
                </animated.div>
              </animated.div>
            </Box>
          )}
        </Box>
      </Box>
    </FadeInWrapper>
  );
}
