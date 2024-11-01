import React from "react";
import { Icon, SimpleGrid, useColorModeValue, Center } from "@chakra-ui/react";
import { GiWeightLiftingUp, GiWeightScale } from "react-icons/gi";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import Loading from "views/admin/weightStats/components/Loading";
import DropdownAlternate from "components/dropdowns/DropdownAlternate";
import { WeightDifference } from "variables/weightStats";

interface DropdownsProps {
  /** Дата на последно запазване на данните за потребителя */
  userDataLastSavedDate: string;
  /** Разлика от перфектното тегло */
  differenceFromPerfectWeight: WeightDifference;
  /** Промяна на разликата от перфектното тегло */
  differenceFromPerfectWeightChange: number;
  /** Състояние на здравето */
  health: string;
  /** Перфектно тегло */
  perfectWeight: number;
  /** Видимост на дропдауна */
  dropdownVisible: boolean;
  /** Функция за управление на видимостта на дропдауна */
  handleDropdownToggle: () => void;
  /** Функция за изчисляване на препоръчителната цел */
  calculateRecommendedGoal: () => string;
}

/**
 * Компонент за показване на дропдаун с информация за теглото.
 *
 * @param {DropdownsProps} props - Свойствата на компонента.
 * @returns {JSX.Element} - Връща дропдаун с данни за теглото.
 */
const AlertDropdown: React.FC<DropdownsProps> = ({
  userDataLastSavedDate,
  differenceFromPerfectWeight,
  differenceFromPerfectWeightChange,
  health,
  perfectWeight,
  dropdownVisible,
  handleDropdownToggle,
  calculateRecommendedGoal
}) => {
  const [loading, setLoading] = React.useState(true);
  const gradientLight = "linear-gradient(90deg, #422afb 0%, #715ffa 50%)";
  const gradientDark = "linear-gradient(90deg, #715ffa 0%, #422afb 100%)";
  const gradient = useColorModeValue(gradientLight, gradientDark);

  // useEffect за зареждане на компонента докато не са подадени нужните данни.
  React.useEffect(() => {
    if (
      health &&
      perfectWeight &&
      differenceFromPerfectWeightChange !== undefined &&
      differenceFromPerfectWeight !== undefined &&
      (userDataLastSavedDate || userDataLastSavedDate == "") &&
      loading
    ) {
      setLoading(false);
    }
  }, [
    health,
    perfectWeight,
    differenceFromPerfectWeightChange,
    differenceFromPerfectWeight,
    userDataLastSavedDate,
    loading
  ]);

  return (
    <>
      {loading ? (
        <Center>
          <Loading />
        </Center>
      ) : (
        <DropdownAlternate
          handleDropdownToggle={handleDropdownToggle}
          dropdownVisible={dropdownVisible}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mt="40px">
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
                      as={GiWeightLiftingUp}
                      color="white"
                    />
                  }
                />
              }
              name="Перфектно тегло"
              value={perfectWeight + " kg"}
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
                      as={GiWeightLiftingUp}
                      color="white"
                    />
                  }
                />
              }
              name={`Вие сте ${
                differenceFromPerfectWeight.isUnderOrAbove == "above"
                  ? "над"
                  : "под"
              } нормата:`}
              value={
                Math.abs(differenceFromPerfectWeight.difference).toFixed(2) +
                " kg"
              }
              growth={
                differenceFromPerfectWeightChange
                  ? differenceFromPerfectWeightChange > 0
                    ? `+${differenceFromPerfectWeightChange.toFixed(2)}`
                    : null
                  : null
              }
              decrease={
                differenceFromPerfectWeightChange
                  ? differenceFromPerfectWeightChange <= 0
                    ? `${differenceFromPerfectWeightChange.toFixed(2)}`
                    : null
                  : null
              }
              subtext={`в сравнение с ${userDataLastSavedDate}`}
            />
            <MiniStatistics
              startContent={
                <IconBox
                  w="56px"
                  h="56px"
                  bg={gradient}
                  transition="background-image 0.5s ease-in-out"
                  icon={
                    <Icon w="32px" h="32px" as={GiWeightScale} color="white" />
                  }
                />
              }
              name="Състояние"
              value={health}
            />
            <MiniStatistics
              startContent={
                <IconBox
                  w="56px"
                  h="56px"
                  bg={gradient}
                  transition="background-image 0.5s ease-in-out"
                  icon={
                    <Icon w="32px" h="32px" as={GiWeightScale} color="white" />
                  }
                />
              }
              name="Препоръчително е да:"
              value={calculateRecommendedGoal() + " (кг.)"}
            />
          </SimpleGrid>
        </DropdownAlternate>
      )}
    </>
  );
};

export default AlertDropdown;
