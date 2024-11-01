import React from "react";
import {
  Box,
  Icon,
  Text,
  Image,
  Center,
  SimpleGrid,
  useColorModeValue
} from "@chakra-ui/react";
import { ColumnChart } from "components/charts/BarCharts";
import MiniStatistics from "components/card/MiniStatistics";
import Card from "components/card/Card";
import IconBox from "components/icons/IconBox";
import { GiWeightScale } from "react-icons/gi";
import ChatGPT from "../../../../assets/img/layout/chatlogo.png";
import Gemini from "../../../../assets/img/layout/gemini.png";
import { Deviations } from "../../../../variables/weightStats";
import Loading from "views/admin/weightStats/components/Loading";

interface DeviationsProps {
  allUsersHealthStatesLabels: string[];
  allUsersHealthStatesData: number[];
  deviations: Deviations;
}

export default function DeviationsAndHealthStatuses({
  allUsersHealthStatesLabels,
  allUsersHealthStatesData,
  deviations
}: DeviationsProps) {
  // Цвета на диаграмите в зависимост от тъмния или светъл режим
  const chartsColor = useColorModeValue("brand.500", "white");

  // Градиентен фон за светъл и тъмен режим
  const gradientLight = "linear-gradient(90deg, #422afb 0%, #715ffa 100%)";
  const gradientDark = "linear-gradient(90deg, #715ffa 0%, #422afb 100%)";
  const gradient = useColorModeValue(gradientLight, gradientDark);

  // Цвета на рамката в зависимост от режима
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  // State за зареждане на отклонения
  const [deviationsLoading, setDeviationsLoading] = React.useState(true);

  // State за зареждане на здравословното състояние
  const [healthLoading, setHealthLoading] = React.useState(false);

  // useEffect за следене на отклоненията и обновяване на състоянието на зареждане
  React.useEffect(() => {
    if (!deviations) {
      setDeviationsLoading(true);
    } else {
      setDeviationsLoading(false);
    }
  }, [deviations]);

  // useEffect за следене на данните за здравословното състояние и обновяване на състоянието на зареждане
  React.useEffect(() => {
    if (!allUsersHealthStatesLabels || !allUsersHealthStatesData) {
      setHealthLoading(true);
    } else {
      setHealthLoading(false);
    }
  }, [allUsersHealthStatesLabels, allUsersHealthStatesData]);

  return (
    <>
      {deviationsLoading || healthLoading ? (
        <Center>
          <Loading />
        </Center>
      ) : (
        <SimpleGrid
          columns={{ base: 1, md: 1, lg: 1, "2xl": 1 }}
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
              <b>Съпоставка на отклоненията на OpenAI и Gemini</b>
            </Text>
          </Card>
          <Box>
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
              <SimpleGrid
                columns={{ base: 1, md: 3, lg: 3 }}
                gap="80px"
                mb="10px"
              >
                {/* ChatGPT */}
                <Box textAlign="center">
                  <Image
                    src={ChatGPT}
                    alt="ChatGPT"
                    boxSize="100px"
                    w="200px"
                    ml="24.5%"
                  />
                  <Text
                    mt="4"
                    fontSize="2xl"
                    textColor="#00A67E"
                    fontWeight="500"
                  >
                    {deviations &&
                      deviations.openAI.averageDeviationPercentage
                        ?.overallAverage}
                  </Text>
                </Box>

                {/* vs */}
                <Text textAlign="center" fontSize="5xl" mt="50px">
                  vs
                </Text>

                {/* gemini */}
                <Box textAlign="center">
                  <Image src={Gemini} alt="gemini" boxSize="100px" w="200px" />
                  <Text
                    mt="4"
                    fontSize="2xl"
                    textColor="#4992e6"
                    fontWeight="500"
                  >
                    {deviations &&
                      deviations.gemini.averageDeviationPercentage
                        ?.overallAverage}
                  </Text>
                </Box>
              </SimpleGrid>

              {/* Deviation stats */}
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 2 }}
                gap="80px"
                mb="10px"
              >
                {/* ChatGPT Deviation Stats */}
                <Box>
                  <Text
                    fontSize="4xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <b>Средно отклонение на:</b>
                  </Text>
                  <SimpleGrid
                    columns={{ base: 1, md: 2, lg: 2 }}
                    gap="20px"
                    mb="10px"
                  >
                    {/* MiniStatistics components for gemini average deviation */}
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
                      name="Калории"
                      value={`${
                        deviations &&
                        deviations.openAI.averageDeviation?.calories.toFixed(2)
                      } g `}
                      loading={deviationsLoading}
                      growth={`(${
                        deviations &&
                        deviations.openAI.averageDeviationPercentage
                          ?.categoryAverages?.calories
                      })`}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Протеин"
                      value={`${
                        deviations &&
                        deviations.openAI.averageDeviation?.protein.toFixed(2)
                      } g `}
                      loading={deviationsLoading}
                      growth={`(${
                        deviations &&
                        deviations.openAI.averageDeviationPercentage
                          ?.categoryAverages?.protein
                      })`}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Въглехидрати"
                      value={`${
                        deviations &&
                        deviations.openAI.averageDeviation?.carbohydrates.toFixed(
                          2
                        )
                      } g `}
                      loading={deviationsLoading}
                      growth={`(${
                        deviations &&
                        deviations.openAI.averageDeviationPercentage
                          ?.categoryAverages?.carbohydrates
                      })`}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Мазнини"
                      value={`${
                        deviations &&
                        deviations.openAI.averageDeviation?.fat.toFixed(2)
                      } g `}
                      loading={deviationsLoading}
                      growth={`(${
                        deviations &&
                        deviations.openAI.averageDeviationPercentage
                          ?.categoryAverages?.fat
                      })`}
                    />
                  </SimpleGrid>
                  <Text
                    fontSize="4xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <b>Максимално отклонение на:</b>
                  </Text>
                  <SimpleGrid
                    columns={{ base: 1, md: 2, lg: 2 }}
                    gap="20px"
                    mb="10px"
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
                      name="Калории"
                      value={`${
                        deviations &&
                        deviations.openAI.maxDeviation?.calories.toFixed(2)
                      } kCal`}
                      loading={deviationsLoading}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Протеин"
                      value={`${
                        deviations &&
                        deviations.openAI.maxDeviation?.protein.toFixed(2)
                      } g`}
                      loading={deviationsLoading}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Въглехидрати"
                      value={`${
                        deviations &&
                        deviations.openAI.maxDeviation?.carbohydrates.toFixed(2)
                      } g`}
                      loading={deviationsLoading}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Мазнини"
                      value={`${
                        deviations &&
                        deviations.openAI.maxDeviation?.fat.toFixed(2)
                      } g`}
                      loading={deviationsLoading}
                    />
                  </SimpleGrid>
                </Box>
                {/* gemini Deviation Stats */}
                <Box>
                  <Text
                    fontSize="4xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <b>Средно отклонение на:</b>
                  </Text>
                  <SimpleGrid
                    columns={{ base: 1, md: 2, lg: 2 }}
                    gap="20px"
                    mb="10px"
                  >
                    {/* MiniStatistics components for gemini average deviation */}
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
                      name="Калории"
                      value={`${
                        deviations &&
                        deviations.gemini.averageDeviation?.calories.toFixed(2)
                      } g `}
                      loading={deviationsLoading}
                      growth={`(${
                        deviations &&
                        deviations.gemini.averageDeviationPercentage
                          ?.categoryAverages?.calories
                      })`}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Протеин"
                      value={`${
                        deviations &&
                        deviations.gemini.averageDeviation?.protein.toFixed(2)
                      } g `}
                      loading={deviationsLoading}
                      growth={`(${
                        deviations &&
                        deviations.gemini.averageDeviationPercentage
                          ?.categoryAverages?.protein
                      })`}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Въглехидрати"
                      value={`${
                        deviations &&
                        deviations.gemini.averageDeviation?.carbohydrates.toFixed(
                          2
                        )
                      } g `}
                      loading={deviationsLoading}
                      growth={`(${
                        deviations &&
                        deviations.gemini.averageDeviationPercentage
                          ?.categoryAverages?.carbohydrates
                      })`}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Мазнини"
                      value={`${
                        deviations &&
                        deviations.gemini.averageDeviation?.fat.toFixed(2)
                      } g `}
                      loading={deviationsLoading}
                      growth={`(${
                        deviations &&
                        deviations.gemini.averageDeviationPercentage
                          ?.categoryAverages?.fat
                      })`}
                    />
                  </SimpleGrid>
                  <Text
                    fontSize="4xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <b>Максимално отклонение на:</b>
                  </Text>
                  <SimpleGrid
                    columns={{ base: 1, md: 2, lg: 2 }}
                    gap="20px"
                    mb="10px"
                  >
                    {/* MiniStatistics components for gemini max deviation */}
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
                      name="Калории"
                      value={`${
                        deviations &&
                        deviations.gemini.maxDeviation?.calories.toFixed(2)
                      } kCal`}
                      loading={deviationsLoading}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Протеин"
                      value={`${
                        deviations &&
                        deviations.gemini.maxDeviation?.protein.toFixed(2)
                      } g`}
                      loading={deviationsLoading}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Въглехидрати"
                      value={`${
                        deviations &&
                        deviations.gemini.maxDeviation?.carbohydrates.toFixed(2)
                      } g`}
                      loading={deviationsLoading}
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
                              as={GiWeightScale}
                              color="white"
                            />
                          }
                        />
                      }
                      name="Мазнини"
                      value={`${
                        deviations &&
                        deviations.gemini.maxDeviation?.fat.toFixed(2)
                      } g`}
                      loading={deviationsLoading}
                    />
                  </SimpleGrid>
                </Box>
              </SimpleGrid>
            </Card>
          </Box>
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
              <b>Състояния на всички потребители</b>
            </Text>
          </Card>
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
              <ColumnChart
                chartLabels={allUsersHealthStatesLabels}
                chartData={allUsersHealthStatesData}
                chartLabelName="Състояния на всички потребители"
                textColor={chartsColor}
                color="#523bff"
              />
            </Card>
          </Box>
        </SimpleGrid>
      )}
    </>
  );
}
