// UserPreferencesInput.tsx
import React from "react";
import {
  Input,
  Button,
  Checkbox,
  Text,
  Flex,
  Box,
  Image,
  SimpleGrid,
  Tooltip,
  useColorModeValue
} from "@chakra-ui/react";
import OpenAIImage from "../../../../assets/img/layout/openai.png";
import GeminiImage from "../../../../assets/img/layout/geminiStar.png";
import { GiHearts } from "react-icons/gi";
import { UserPreferencesForMealPlan } from "../../../../variables/weightStats";
import { useSpring, animated } from "react-spring";
import Card from "components/card/Card";
import { HSeparator } from "components/separator/Separator";

interface UserPreferencesInputProps {
  userPreferences: UserPreferencesForMealPlan;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  generatePlanWithOpenAI: () => void;
  generatePlanWithGemini: () => void;
  useFavoritesForPlan: boolean;
  handleFavoritesCheckboxChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}
const fieldName: string[] = [
  "калории",
  "протеин",
  "мазнини",
  "въглехидрати",
  "кухня",
  "какво да не се включва"
];

const UserPreferencesForMealPlanForm: React.FC<UserPreferencesInputProps> = ({
  useFavoritesForPlan,
  handleFavoritesCheckboxChange,
  userPreferences,
  handleInputChange,
  handleCheckboxChange,
  generatePlanWithOpenAI,
  generatePlanWithGemini
}) => {
  const textColor = useColorModeValue("#1a202c", "white");
  const bgButton = useColorModeValue("secondaryGray.200", "whiteAlpha.100");
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "navy.700");
  const gradientLight = "linear-gradient(90deg, #422afb 0%, #715ffa 50%)";
  const gradientDark = "linear-gradient(90deg, #715ffa 0%, #422afb 100%)";
  const gradient = useColorModeValue(gradientLight, gradientDark);
  const dropdownBoxBg = useColorModeValue("secondaryGray.300", "navy.700");
  const dropdownActiveBoxBg = useColorModeValue("#d8dced", "#171F3D");
  const [validationErrors, setValidationErrors] = React.useState<{
    [key: string]: string;
  }>({});

  const DropdownPosition = useSpring({
    opacity: 1,
    transform: `translateY(${-50}px)`,
    config: {
      tension: 170,
      friction: 12
    }
  });

  const isNutrientDataValid = () => {
    const errors: { [key: string]: string } = {};

    const validateNutrient = (
      value: number,
      fieldName: string,
      fieldNameBG: string
    ) => {
      if (value <= 0) {
        errors[
          fieldName
        ] = `Моля, въведете валидна стойност за ${fieldNameBG}.`;
      }
    };

    validateNutrient(userPreferences.Calories, "Calories", fieldName[0]);
    validateNutrient(
      userPreferences.Carbohydrates,
      "Carbohydrates",
      fieldName[3]
    );
    validateNutrient(userPreferences.Fat, "Fat", fieldName[2]);
    validateNutrient(userPreferences.Protein, "Protein", fieldName[1]);

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmitWithOpenAI = (event: React.FormEvent) => {
    event.preventDefault();

    if (isNutrientDataValid()) {
      generatePlanWithOpenAI();
    }
  };

  const handleSubmitWithGemini = (event: React.FormEvent) => {
    event.preventDefault();

    if (isNutrientDataValid()) {
      generatePlanWithGemini();
    }
  };

  const englishCuisines = ["Bulgarian", "Spanish", "Italian", "French"];

  const bulgarianCuisines = ["Българска", "Испанска", "Италианска", "Френска"];

  const countriesFlags = [
    "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Bulgaria.svg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Bandera_de_Espa%C3%B1a.svg/1280px-Bandera_de_Espa%C3%B1a.svg.png",
    "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Flag_of_Italy.svg/1280px-Flag_of_Italy.svg.png",
    "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Flag_of_France.svg/800px-Flag_of_France.svg.png"
  ];
  return (
    <Card>
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        gap={{ base: "10px", md: "20px" }}
      >
        {Object.entries(userPreferences).map(([key, value], index) => {
          if (key !== "Cuisine") {
            return (
              <Box key={key}>
                <Flex justify="center" pt="5px" w="100%" mt="5px">
                  <Text fontSize="2xl" mb="0px">
                    {fieldName[index].charAt(0).toUpperCase() +
                      fieldName[index].slice(1)}
                    :
                  </Text>
                </Flex>
                <Flex>
                  {value !== 0 && typeof value !== "string" ? (
                    <Input
                      variant="auth"
                      color={textColor}
                      focusBorderColor="#7551ff"
                      fontSize={{ base: "sm", md: "md" }}
                      ms={{ base: "0px", md: "0px" }}
                      placeholder={"Въведете " + fieldName[index]}
                      _placeholder={{ opacity: 1, color: "gray.500" }}
                      value={value || ""}
                      mt={{ base: "0", md: "1%", sm: "0" }}
                      mb={{ base: "1%", md: "2%", sm: "4%" }}
                      fontWeight="500"
                      size="lg"
                      type="number"
                      name={key}
                      onChange={handleInputChange}
                    />
                  ) : typeof value == "string" ? (
                    <Input
                      variant="auth"
                      color={textColor}
                      focusBorderColor="#7551ff"
                      fontSize={{ base: "sm", md: "md" }}
                      ms={{ base: "0px", md: "0px" }}
                      placeholder={"Въведете " + fieldName[index]}
                      _placeholder={{ opacity: 1, color: "gray.500" }}
                      value={value || ""}
                      mt={{ base: "0", md: "1%", sm: "0" }}
                      mb={{ base: "1%", md: "2%", sm: "4%" }}
                      fontWeight="500"
                      size="lg"
                      type="text"
                      name={key}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <Input
                      variant="auth"
                      color={textColor}
                      focusBorderColor="#7551ff"
                      fontSize={{ base: "sm", md: "md" }}
                      ms={{ base: "0px", md: "0px" }}
                      placeholder={"Въведете " + fieldName[index]}
                      _placeholder={{ opacity: 1, color: "gray.500" }}
                      value={""}
                      mt={{ base: "0", md: "1%", sm: "0" }}
                      mb={{ base: "1%", md: "2%", sm: "4%" }}
                      fontWeight="500"
                      size="lg"
                      type="number"
                      name={key}
                      onChange={handleInputChange}
                    />
                  )}
                </Flex>
                {validationErrors[key] && (
                  <Text color="red" fontSize="sm">
                    {validationErrors[key]}
                  </Text>
                )}
              </Box>
            );
          }
        })}
        <Box mt="20px">
          <Card
            zIndex="1"
            position="relative"
            bg={dropdownActiveBoxBg}
            transition="background-image 0.5s ease-in-out"
            minH="80px" // Use minHeight instead of height
            maxH={{ sm: "200px", md: "100px", lg: "auto" }}
          >
            <Flex
              alignItems="center"
              mt="3px"
              position="relative"
              flexWrap="wrap" // Allow items to wrap to the next line
            >
              <Text
                fontSize="2xl"
                style={{
                  backgroundImage: gradient,
                  WebkitBackgroundClip: "text",
                  color: "transparent"
                }}
                userSelect="none"
                mr="5px"
              >
                <b>Изберете кухня:</b>
              </Text>
              {englishCuisines.map(
                (cuisine, index) =>
                  userPreferences.Cuisine &&
                  (Array.isArray(userPreferences.Cuisine)
                    ? userPreferences.Cuisine.includes(cuisine)
                    : userPreferences.Cuisine === cuisine) && (
                    <Tooltip
                      label={bulgarianCuisines[index]}
                      aria-label={bulgarianCuisines[index]}
                    >
                      <Image
                        src={`${countriesFlags[index]}`}
                        alt={bulgarianCuisines[index]}
                        maxW="35px"
                        ml="2px" // Adjust margin as needed
                        mr="2px" // Adjust margin as needed
                        mb="2px" // Add margin between flags
                      />
                    </Tooltip>
                  )
              )}
            </Flex>
          </Card>
          <animated.div style={{ ...DropdownPosition, position: "relative" }}>
            <Card bg={boxBg} minH={{ base: "100px", md: "100px", xl: "100px" }}>
              <SimpleGrid mt="50px" columns={{ base: 2, md: 2, xl: 4 }}>
                {englishCuisines.map((cuisine, index) => (
                  <Checkbox
                    key={cuisine}
                    name={cuisine}
                    isChecked={
                      Array.isArray(userPreferences.Cuisine)
                        ? userPreferences.Cuisine.includes(cuisine)
                        : userPreferences.Cuisine === cuisine
                    }
                    onChange={handleCheckboxChange}
                  >
                    <Flex alignItems="center" gap="1px">
                      <Tooltip
                        label={bulgarianCuisines[index]}
                        aria-label={bulgarianCuisines[index]}
                      >
                        <Image
                          src={`${countriesFlags[index]}`}
                          alt={bulgarianCuisines[index]}
                          maxW="35px"
                        />
                      </Tooltip>
                    </Flex>
                  </Checkbox>
                ))}
              </SimpleGrid>
            </Card>
          </animated.div>
        </Box>
      </SimpleGrid>
      <SimpleGrid columns={{ base: 2, md: 2, xl: 2 }} gap={4}>
        <Button
          onClick={handleSubmitWithOpenAI}
          minH="60px"
          minW="100%"
          backgroundColor={bgButton}
          color={brandColor}
        >
          Създайте хранителен план с OpenAI{" "}
          <Box boxSize="30px" ml="10px">
            <Image src={OpenAIImage} />
          </Box>
        </Button>
        <Button
          onClick={handleSubmitWithGemini}
          minH="60px"
          minW="100%"
          backgroundColor={bgButton}
          color={brandColor}
        >
          Създайте хранителен план с Gemini
          <Box boxSize="40px" mb="7px" ml="5px">
            <Image src={GeminiImage} />
          </Box>
        </Button>
      </SimpleGrid>
      <Box mt="50px">
        <Flex alignItems="center" justifyContent="center">
          <HSeparator style={{ flex: 1, marginRight: "10px" }} />
          <Box boxSize="30px" mx="8px">
            <GiHearts size="30px" color="rgba(135, 140, 189, 0.3)" />
          </Box>
          <Text mx="5px" color="rgba(135, 140, 189, 0.3)" fontSize="xl">
            Или създайте хранителен план от вашите любими храни
          </Text>
          <Checkbox
            ml="8px"
            colorScheme="purple"
            isChecked={useFavoritesForPlan}
            onChange={handleFavoritesCheckboxChange}
          />
          <Box boxSize="30px" mx="8px">
            <GiHearts size="30px" color="rgba(135, 140, 189, 0.3)" />
          </Box>
          <HSeparator style={{ flex: 1, marginLeft: "10px" }} />
        </Flex>
      </Box>
    </Card>
  );
};

export default UserPreferencesForMealPlanForm;
