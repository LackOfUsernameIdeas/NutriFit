import { Icon, SimpleGrid, useColorModeValue } from "@chakra-ui/react";
import Card from "components/card/Card";
import FadeInWrapper from "components/wrapper/FadeInWrapper";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import { MdLocalFireDepartment } from "react-icons/md";
import { TbActivityHeartbeat } from "react-icons/tb";
import {
  FaAngleDown,
  FaAngleDoubleDown,
  FaGripLines,
  FaAngleDoubleUp,
  FaAngleUp
} from "react-icons/fa";
import {
  DailyCaloryRequirements,
  UserData
} from "../../../../variables/weightStats";
import { useState, useEffect } from "react";
import { saveGoal } from "database/setFunctions";
import { getAuth } from "firebase/auth";

interface CalorieRequirementsProps {
  /** Изисквания за дневни калории */
  calorieRequirements: DailyCaloryRequirements[];
  /** Избраното ниво на активност */
  selectedActivityLevel: number;
  /** Кликната стойност на калориите (по избор) */
  clickedValueCalories?: number | null;
  /** Функция за задаване на кликнатата стойност на калориите */
  setClickedValueCalories?: React.Dispatch<React.SetStateAction<number | null>>;
  /** Функция за задаване на избраната цел */
  setSelectedGoal?: React.Dispatch<React.SetStateAction<string>>;
  /** Функция за задаване на данните за потребителя */
  setUserData?: React.Dispatch<React.SetStateAction<UserData>>;
}

/**
 * Компонент за показване на изискванията за калории в зависимост от нивото на активност.
 *
 * @param {CalorieRequirementsProps} props - Свойствата на компонента.
 * @returns {JSX.Element} - Връща компонент с информация за дневните калории.
 */
export default function CalorieRequirements(props: CalorieRequirementsProps) {
  const bgHover = useColorModeValue("secondaryGray.200", "whiteAlpha.50"); // Цвят на фона при задържане
  const gradientLight = "linear-gradient(90deg, #422afb 0%, #715ffa 50%)"; // Светла градиентна стойност
  const gradientDark = "linear-gradient(90deg, #715ffa 0%, #422afb 100%)"; // Тъмна градиентна стойност
  const gradient = useColorModeValue(gradientLight, gradientDark); // Избор на градиент в зависимост от режима на цветовете

  const {
    clickedValueCalories,
    setClickedValueCalories,
    setSelectedGoal,
    setUserData
  } = props;

  // Състояние за дневните калорийни изисквания
  const [dailyCaloryRequirements, setDailyCaloryRequirement] = useState<
    DailyCaloryRequirements[]
  >(props.calorieRequirements);

  // useEffect за обновяване на дневните калорийни изисквания, когато променят свойствата
  useEffect(() => {
    setDailyCaloryRequirement(props.calorieRequirements);
  }, [props.calorieRequirements, props.selectedActivityLevel]);

  const uid = getAuth().currentUser.uid; // Получаване на идентификатора на текущия потребител
  const selectedLevelData =
    dailyCaloryRequirements[props.selectedActivityLevel - 1]; // Избиране на данните за текущото ниво на активност

  return (
    <FadeInWrapper>
      <Card>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px">
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={gradient}
                transition="background-image 0.5s ease-in-out"
                icon={
                  <Icon
                    w="32px"
                    h="32px"
                    as={MdLocalFireDepartment}
                    color="white"
                  />
                }
              />
            }
            tooltipLabel="Базов метаболизъм е общото количество енергия, което е нужно на тялото за да поддържа жизнените си функции."
            name="Базов метаболизъм"
            value={selectedLevelData.BMR.toFixed(2) + " kcal"}
          />
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={gradient}
                transition="background-image 0.5s ease-in-out"
                icon={
                  <Icon
                    w="32px"
                    h="32px"
                    as={TbActivityHeartbeat}
                    color="white"
                  />
                }
              />
            }
            tooltipLabel={`За да отслабнете с ${
              selectedLevelData.goals["Mild weight loss"]["loss weight"]
            } на седмица, трябва да приемате приблизително ${selectedLevelData.goals[
              "Mild weight loss"
            ].calory.toFixed(2)} калории на ден`}
            name="Леко сваляне на тегло"
            value={
              selectedLevelData.goals["Mild weight loss"].calory.toFixed(2) +
              " kcal"
            }
            onClick={() => {
              setClickedValueCalories(
                parseFloat(
                  selectedLevelData.goals["Mild weight loss"].calory.toFixed(2)
                )
              );
              setSelectedGoal("mildlose");
              saveGoal(uid, "mildlose");
              setUserData((prevState) => ({ ...prevState, goal: "mildlose" }));
            }}
            backgroundColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Mild weight loss"].calory.toFixed(2)
              )
                ? bgHover
                : undefined
            }
            hasBorder={true}
            borderColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Mild weight loss"].calory.toFixed(2)
              )
                ? true
                : false
            }
            hasHoverAndFocus={true}
          />
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={gradient}
                transition="background-image 0.5s ease-in-out"
                icon={<Icon w="32px" h="32px" as={FaAngleDown} color="white" />}
              />
            }
            tooltipLabel={`За да отслабнете с ${
              selectedLevelData.goals["Weight loss"]["loss weight"]
            } на седмица, трябва да приемате приблизително ${selectedLevelData.goals[
              "Weight loss"
            ].calory.toFixed(2)} калории на ден`}
            name="Сваляне на тегло"
            value={
              selectedLevelData.goals["Weight loss"].calory.toFixed(2) + " kcal"
            }
            onClick={() => {
              setClickedValueCalories(
                parseFloat(
                  selectedLevelData.goals["Weight loss"].calory.toFixed(2)
                )
              );
              setSelectedGoal("weightlose");
              saveGoal(uid, "weightlose");
              setUserData((prevState) => ({
                ...prevState,
                goal: "weightlose"
              }));
            }}
            backgroundColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Weight loss"].calory.toFixed(2)
              )
                ? bgHover
                : undefined
            }
            hasBorder={true}
            borderColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Weight loss"].calory.toFixed(2)
              )
                ? true
                : false
            }
            hasHoverAndFocus={true}
          />
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={gradient}
                transition="background-image 0.5s ease-in-out"
                icon={
                  <Icon
                    w="32px"
                    h="32px"
                    as={FaAngleDoubleDown}
                    color="white"
                  />
                }
              />
            }
            tooltipLabel={`За да отслабнете с ${
              selectedLevelData.goals["Extreme weight loss"]["loss weight"]
            } на седмица, трябва да приемате приблизително ${selectedLevelData.goals[
              "Extreme weight loss"
            ].calory.toFixed(2)} калории на ден`}
            name="Екстремно сваляне на тегло"
            value={
              selectedLevelData.goals["Extreme weight loss"].calory.toFixed(2) +
              " kcal"
            }
            onClick={() => {
              setClickedValueCalories(
                parseFloat(
                  selectedLevelData.goals["Extreme weight loss"].calory.toFixed(
                    2
                  )
                )
              );
              setSelectedGoal("extremelose");
              saveGoal(uid, "extremelose");
              setUserData((prevState) => ({
                ...prevState,
                goal: "extremelose"
              }));
            }}
            backgroundColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Extreme weight loss"].calory.toFixed(2)
              )
                ? bgHover
                : undefined
            }
            hasBorder={true}
            borderColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Extreme weight loss"].calory.toFixed(2)
              )
                ? true
                : false
            }
            hasHoverAndFocus={true}
          />
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={gradient}
                transition="background-image 0.5s ease-in-out"
                icon={<Icon w="32px" h="32px" as={FaGripLines} color="white" />}
              />
            }
            tooltipLabel={`За да поддържате теглото си, трябва да приемате приблизително ${selectedLevelData.goals[
              "maintain weight"
            ].toFixed(2)} калории на ден`}
            name="Запазване на тегло"
            value={
              selectedLevelData.goals["maintain weight"].toFixed(2) + " kcal"
            }
            onClick={() => {
              setClickedValueCalories(
                parseFloat(
                  selectedLevelData.goals["maintain weight"].toFixed(2)
                )
              );
              setSelectedGoal("maintain");
              saveGoal(uid, "maintain");
              setUserData((prevState) => ({ ...prevState, goal: "maintain" }));
            }}
            backgroundColor={
              clickedValueCalories ===
              parseFloat(selectedLevelData.goals["maintain weight"].toFixed(2))
                ? bgHover
                : undefined
            }
            hasBorder={true}
            borderColor={
              clickedValueCalories ===
              parseFloat(selectedLevelData.goals["maintain weight"].toFixed(2))
                ? true
                : false
            }
            hasHoverAndFocus={true}
          />
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={gradient}
                transition="background-image 0.5s ease-in-out"
                icon={
                  <Icon
                    w="32px"
                    h="32px"
                    as={TbActivityHeartbeat}
                    color="white"
                  />
                }
              />
            }
            tooltipLabel={`За да качите ${
              selectedLevelData.goals["Mild weight gain"]["gain weight"]
            } на седмица, трябва да приемате приблизително ${selectedLevelData.goals[
              "Mild weight gain"
            ].calory.toFixed(2)} калории на ден`}
            name="Леко качване на тегло"
            value={
              selectedLevelData.goals["Mild weight gain"].calory.toFixed(2) +
              " kcal"
            }
            onClick={() => {
              setClickedValueCalories(
                parseFloat(
                  selectedLevelData.goals["Mild weight gain"].calory.toFixed(2)
                )
              );
              setSelectedGoal("mildgain");
              saveGoal(uid, "mildgain");
              setUserData((prevState) => ({ ...prevState, goal: "mildgain" }));
            }}
            backgroundColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Mild weight gain"].calory.toFixed(2)
              )
                ? bgHover
                : undefined
            }
            hasBorder={true}
            borderColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Mild weight gain"].calory.toFixed(2)
              )
                ? true
                : false
            }
            hasHoverAndFocus={true}
          />
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={gradient}
                transition="background-image 0.5s ease-in-out"
                icon={<Icon w="32px" h="32px" as={FaAngleUp} color="white" />}
              />
            }
            tooltipLabel={`За да качите ${
              selectedLevelData.goals["Weight gain"]["gain weight"]
            } на седмица, трябва да приемате приблизително ${selectedLevelData.goals[
              "Weight gain"
            ].calory.toFixed(2)} калории на ден`}
            name="Качване на тегло"
            value={
              selectedLevelData.goals["Weight gain"].calory.toFixed(2) + " kcal"
            }
            onClick={() => {
              setClickedValueCalories(
                parseFloat(
                  selectedLevelData.goals["Weight gain"].calory.toFixed(2)
                )
              );
              setSelectedGoal("weightgain");
              saveGoal(uid, "weightgain");
              setUserData((prevState) => ({
                ...prevState,
                goal: "weightgain"
              }));
            }}
            backgroundColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Weight gain"].calory.toFixed(2)
              )
                ? bgHover
                : undefined
            }
            hasBorder={true}
            borderColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Weight gain"].calory.toFixed(2)
              )
                ? true
                : false
            }
            hasHoverAndFocus={true}
          />
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={gradient}
                transition="background-image 0.5s ease-in-out"
                icon={
                  <Icon w="32px" h="32px" as={FaAngleDoubleUp} color="white" />
                }
              />
            }
            tooltipLabel={`За да качите ${
              selectedLevelData.goals["Extreme weight gain"]["gain weight"]
            } на седмица, трябва да приемате приблизително ${selectedLevelData.goals[
              "Extreme weight gain"
            ].calory.toFixed(2)} калории на ден`}
            name="Екстремно качване на тегло"
            value={
              selectedLevelData.goals["Extreme weight gain"].calory.toFixed(2) +
              " kcal"
            }
            onClick={() => {
              setClickedValueCalories(
                parseFloat(
                  selectedLevelData.goals["Extreme weight gain"].calory.toFixed(
                    2
                  )
                )
              );
              setSelectedGoal("extremegain");
              saveGoal(uid, "extremegain");
              setUserData((prevState) => ({
                ...prevState,
                goal: "extremegain"
              }));
            }}
            backgroundColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Extreme weight gain"].calory.toFixed(2)
              )
                ? bgHover
                : undefined
            }
            hasBorder={true}
            borderColor={
              clickedValueCalories ===
              parseFloat(
                selectedLevelData.goals["Extreme weight gain"].calory.toFixed(2)
              )
                ? true
                : false
            }
            hasHoverAndFocus={true}
          />
        </SimpleGrid>
      </Card>
    </FadeInWrapper>
  );
}
