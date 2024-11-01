import { useState, useEffect } from "react";
import { Icon, SimpleGrid, Center } from "@chakra-ui/react";
import Dropdown from "components/dropdowns/Dropdown";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import { FaFireAlt } from "react-icons/fa";
import { GiWeightScale } from "react-icons/gi";
import { RiWaterPercentFill } from "react-icons/ri";
import { MdOutlineMale, MdOutlineFemale } from "react-icons/md";
import { GenderAverageStats } from "../../../../variables/weightStats";
import Loading from "views/admin/weightStats/components/Loading";

interface GenderedDropdownsProps {
  averageStats: GenderAverageStats;
  dropdownVisibleMale: boolean;
  handleDropdownToggleMale: () => void;
  dropdownVisibleFemale: boolean;
  handleDropdownToggleFemale: () => void;
}

export default function GenderedDropdowns({
  averageStats,
  dropdownVisibleMale,
  handleDropdownToggleMale,
  dropdownVisibleFemale,
  handleDropdownToggleFemale
}: GenderedDropdownsProps) {
  const [loading, setLoading] = useState(true);

  // useEffect при промяна на averageStats за спиране на зареждането, когато данните са налични
  useEffect(() => {
    if (averageStats && loading) {
      setLoading(false);
    }
  }, [averageStats, loading]);

  return (
    <>
      {loading ? (
        <Center>
          <Loading />
        </Center>
      ) : (
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 2, "2xl": 2 }}
          gap="20px"
          mb="20px"
        >
          <Dropdown
            title="Средни статистики за МЪЖЕ:"
            handleDropdownToggle={handleDropdownToggleMale}
            dropdownVisible={dropdownVisibleMale}
            icon={MdOutlineFemale}
            isForMale
          >
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 2, "2xl": 2 }}
              gap="20px"
              mt="50px"
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
                        as={GiWeightScale}
                        color="white"
                      />
                    }
                  />
                }
                name="Тегло"
                value={
                  averageStats.male.averageWeight !== null
                    ? `${averageStats.male.averageWeight.toFixed(2)}kg`
                    : "0"
                }
                loading={loading}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                    icon={
                      <Icon w="28px" h="28px" as={FaFireAlt} color="white" />
                    }
                  />
                }
                name="Калории"
                value={
                  averageStats.male.averageCalories !== null
                    ? `${averageStats.male.averageCalories.toFixed(2)}`
                    : "0"
                }
                loading={loading}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                    icon={
                      <Icon w="32px" h="32px" as={FaFireAlt} color="white" />
                    }
                  />
                }
                name="Протеин"
                value={
                  averageStats.male.averageProtein !== null
                    ? `${averageStats.male.averageProtein.toFixed(2)}`
                    : "0"
                }
                loading={loading}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                    icon={
                      <Icon w="32px" h="32px" as={FaFireAlt} color="white" />
                    }
                  />
                }
                name="Въглехидрати"
                value={
                  averageStats.male.averageCarbs !== null
                    ? `${averageStats.male.averageCarbs.toFixed(2)}`
                    : "0"
                }
                loading={loading}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                    icon={
                      <Icon w="32px" h="32px" as={FaFireAlt} color="white" />
                    }
                  />
                }
                name="Мазнини"
                value={
                  averageStats.male.averageFat !== null
                    ? `${averageStats.male.averageFat.toFixed(2)}`
                    : "0"
                }
                loading={loading}
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
                        as={RiWaterPercentFill}
                        color="white"
                      />
                    }
                  />
                }
                name="Тел. Мазнини"
                value={
                  averageStats.male.averageBodyFatPercentage !== null
                    ? `${averageStats.male.averageBodyFatPercentage.toFixed(
                        2
                      )}%`
                    : "0"
                }
                loading={loading}
              />
            </SimpleGrid>
          </Dropdown>
          <Dropdown
            title="Средни статистики за ЖЕНИ:"
            handleDropdownToggle={handleDropdownToggleFemale}
            dropdownVisible={dropdownVisibleFemale}
            icon={MdOutlineMale}
            isForFemale
          >
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 2, "2xl": 2 }}
              mt="50px"
              gap="20px"
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
                        as={GiWeightScale}
                        color="white"
                      />
                    }
                  />
                }
                name="Тегло"
                value={
                  averageStats.female.averageWeight !== null
                    ? `${averageStats.female.averageWeight.toFixed(2)}kg`
                    : "0"
                }
                loading={loading}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                    icon={
                      <Icon w="28px" h="28px" as={FaFireAlt} color="white" />
                    }
                  />
                }
                name="Калории"
                value={
                  averageStats.female.averageCalories !== null
                    ? `${averageStats.female.averageCalories.toFixed(2)}`
                    : "0"
                }
                loading={loading}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                    icon={
                      <Icon w="32px" h="32px" as={FaFireAlt} color="white" />
                    }
                  />
                }
                name="Протеин"
                value={
                  averageStats.female.averageProtein !== null
                    ? `${averageStats.female.averageProtein.toFixed(2)}`
                    : "0"
                }
                loading={loading}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                    icon={
                      <Icon w="32px" h="32px" as={FaFireAlt} color="white" />
                    }
                  />
                }
                name="Въглехидрати"
                value={
                  averageStats.female.averageCarbs !== null
                    ? `${averageStats.female.averageCarbs.toFixed(2)}`
                    : "0"
                }
                loading={loading}
              />
              <MiniStatistics
                startContent={
                  <IconBox
                    w="56px"
                    h="56px"
                    bg="linear-gradient(90deg, #422afb 0%, #715ffa 100%)"
                    icon={
                      <Icon w="32px" h="32px" as={FaFireAlt} color="white" />
                    }
                  />
                }
                name="Мазнини"
                value={
                  averageStats.female.averageFat !== null
                    ? `${averageStats.female.averageFat.toFixed(2)}`
                    : "0"
                }
                loading={loading}
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
                        as={RiWaterPercentFill}
                        color="white"
                      />
                    }
                  />
                }
                name="Тел. Мазнини"
                value={
                  averageStats.female.averageBodyFatPercentage !== null
                    ? `${averageStats.female.averageBodyFatPercentage.toFixed(
                        2
                      )}%`
                    : "0"
                }
                loading={loading}
              />
            </SimpleGrid>
          </Dropdown>
        </SimpleGrid>
      )}
    </>
  );
}
