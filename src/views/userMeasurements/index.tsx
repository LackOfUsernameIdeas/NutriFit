import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchAdditionalUserData } from "database/getFunctions";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useMediaQuery,
  useColorModeValue,
  Image
} from "@chakra-ui/react";
import MeasurementsAlertDialog from "./components/MeasurementsAlertDialog";
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/measurements/Default";
import neckImgDark from "../../assets/img/layout/neck-measurement.png";
import waistImgDark from "../../assets/img/layout/waist-measurement.png";
import hipImgDark from "../../assets/img/layout/hip-measurement.png";
import neckImgWhite from "../../assets/img/layout/neck-measurement-white.png";
import waistImgWhite from "../../assets/img/layout/waist-measurement-white.png";
import hipImgWhite from "../../assets/img/layout/hip-measurement-white.png";
import illustration from "assets/img/auth/auth.png";
import Loading from "views/admin/weightStats/components/Loading";
import { UserData, WeightDifference } from "../../variables/weightStats";

interface UserMeasurements {
  userData: UserData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRadioChange: (key: string, value: string) => void;
  generateStats: () => void;
}

const userDataPropertiesTranslated = [
  "ръст (см)",
  "възраст",
  "тегло (кг)",
  "обиколка на врат (см)",
  "обиколка на талия (см)",
  "oбиколка на таз (см)",
  "цел"
];

const UserMeasurements = () => {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const history = useHistory();
  const [error, setError] = useState("");
  const [isFilledOut, setIsFilledOut] = useState(false);
  const [userDataForToday, setUserDataForToday] = useState(null);
  const [userDataLastSavedDate, setUserDataLastSavedDate] = useState(null);
  const [isTodaysDataFetched, setIsTodaysDataFetched] =
    useState<boolean>(false);
  const isMounted = useRef(true);
  const [user, setUser] = useState(null);

  // State за въведени потребителски данни
  const [userData, setUserData] = useState<UserData>({
    height: 0,
    age: 0,
    weight: 0,
    neck: 0,
    waist: 0,
    hip: 0,
    goal: "maintain"
  });

  // State за зареждане на страницата
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOnMount, setIsLoadingOnMount] = useState(true);

  const [validationErrors, setValidationErrors] = React.useState<{
    [key: string]: string;
  }>({});
  // States за запазване на извличените данни
  const [perfectWeight, setPerfectWeight] = useState<number>(0);
  const [differenceFromPerfectWeight, setDifferenceFromPerfectWeight] =
    useState<WeightDifference>({
      difference: 0,
      isUnderOrAbove: ""
    });

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const timestampKey = new Date().toISOString().slice(0, 10);

          const additionalData = await fetchAdditionalUserData(
            auth.currentUser.uid
          );
          console.log("gender for state: ", additionalData.gender);
          if (additionalData?.[timestampKey]?.age) {
            setUserData({
              goal: additionalData.goal || 0,
              age: additionalData[timestampKey].age || 0,
              height: additionalData[timestampKey].height || 0,
              waist: additionalData[timestampKey].waist || 0,
              neck: additionalData[timestampKey].neck || 0,
              hip: additionalData[timestampKey].hip || 0,
              weight: additionalData[timestampKey].weight || 0
            } as any);
          }
          setUserData((prevData) => {
            return { ...prevData, gender: additionalData.gender };
          });
          console.log(additionalData, "additionalData");
        } catch (error) {
          console.error("Error fetching additional user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoadingOnMount(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Event handler-и за реакция при промяна
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const parsedValue = value.trim() === "" ? 0 : parseFloat(value);

    setUserData((prevData) => {
      console.log("prevData:", prevData);
      return { ...prevData, [name]: parsedValue };
    });
  };

  const triggerFetchAndSaveAllData = async () => {
    const uid = getAuth().currentUser.uid;
    try {
      const response = await fetch(
        `https://nutri-api.noit.eu/fetchAndSaveAllDataNewStructure/${uid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
          },
          body: JSON.stringify({
            height: userData["height"],
            age: userData["age"],
            weight: userData["weight"],
            gender: userData["gender"],
            neck: userData["neck"],
            waist: userData["waist"],
            hip: userData["hip"],
            goalsToFetch: [
              "maintain",
              "mildlose",
              "weightlose",
              "extremelose",
              "mildgain",
              "weightgain",
              "extremegain"
            ]
          })
        }
      );

      const result = await response.json();
      console.log("Server response:", result);
    } catch (error) {
      console.error("Error triggering fetch and save:", error);
    }
  };

  const saveUserData = async () => {
    const uid = getAuth().currentUser.uid;
    try {
      const response = await fetch(
        `https://nutri-api.noit.eu/saveUserDataNewStructure/${uid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
          },
          body: JSON.stringify({
            height: userData["height"],
            age: userData["age"],
            weight: userData["weight"],
            neck: userData["neck"],
            waist: userData["waist"],
            hip: userData["hip"]
          })
        }
      );

      const result = await response.json();
      console.log("Server response SAVING:", result);
      return result;
    } catch (error) {
      console.error("Error triggering fetch and save:", error);
      throw error;
    }
  };
  // Функция за генериране на статистики
  async function generateStats() {
    setIsLoading(true);

    try {
      const saveResult = await saveUserData();

      if (saveResult) {
        triggerFetchAndSaveAllData();
        history.push("/admin/home");
      }
    } catch (error) {
      console.error("Error generating stats:", error);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    // Зарежда последно запазените данни от Local Storage
    const storedValues = JSON.parse(
      localStorage.getItem("lastTypedValues") || "{}"
    );
    Object.keys(storedValues).forEach((key) => {
      handleInputChange({
        target: { name: key, value: storedValues[key] }
      } as React.ChangeEvent<HTMLInputElement>);
    });
  }, []);

  const validateField = (
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): string | undefined => {
    if (value === 0) {
      return `Моля, въведете ${fieldName}.`;
    }

    if (value < min || value > max) {
      return `Полето ${fieldName} трябва да бъде между ${min} и ${max} см.`;
    }

    return undefined;
  };

  const isUserDataValid = () => {
    const errors: { [key: string]: string } = {};

    errors.height = validateField(userData.height, 130, 230, "височина");
    errors.age = validateField(userData.age, 1, 80, "възраст");
    errors.weight = validateField(userData.weight, 40, 160, "тегло");
    errors.neck = validateField(userData.neck, 20, 60, "обиколка на врата");
    errors.waist = validateField(userData.waist, 40, 130, "обиколка на талия");
    errors.hip = validateField(userData.hip, 40, 130, "обиколка на таз");

    setValidationErrors(errors);

    return Object.values(errors).every((error) => error === undefined);
  };

  const handleInputChangeWithMemory = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    handleInputChange(e);

    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    // Запазва последно написаните данни в Local Storage
    const storedValues = JSON.parse(
      localStorage.getItem("lastTypedValues") || "{}"
    );
    localStorage.setItem(
      "lastTypedValues",
      JSON.stringify({ ...storedValues, [name]: value })
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isUserDataValid()) {
      try {
        await generateStats();
        const response = await fetch(
          "https://nutri-api.noit.eu/processUserData",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
            },
            body: JSON.stringify(userData)
          }
        );
        if (response.ok) {
          const responseData = await response.json();
          console.log("Server response:", responseData);

          setIsFilledOut(true);
        } else {
          console.error("Server error:", response.statusText);
          setError("Failed to process data on the server.");
        }
      } catch (error) {
        console.error("Error saving additional user data:", error);
      }
    }
  };

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (isMounted.current) {
        setUser(user);
      }

      if (user) {
        try {
          setIsLoading(true);

          const additionalData = await fetchAdditionalUserData(
            auth.currentUser.uid
          );
          const dateKeys = Object.keys(additionalData).filter((key) =>
            /^\d{4}-\d{2}-\d{2}$/.test(key)
          );
          dateKeys.sort(
            (a, b) => new Date(b).getTime() - new Date(a).getTime()
          );
          const today = new Date().toISOString().slice(0, 10);
          const lastSavedDate = dateKeys.find((date) => date < today);
          const rawUserDataForToday = additionalData[today];
          const rawUserDataForLastSavedDate = additionalData[lastSavedDate];
          if (isMounted.current) {
            setUserDataLastSavedDate(rawUserDataForLastSavedDate);
            setUserDataForToday(rawUserDataForToday);
            setIsTodaysDataFetched(true);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error fetching additional user data:", error);
        }
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [updateWithNewData, setUpdateWithNewData] = useState<boolean>(false);
  useEffect(() => {
    if (userDataLastSavedDate) {
      const commonKeys = Object.keys(userData).filter((key) =>
        Object.keys(userDataLastSavedDate).includes(key)
      );

      const areDataEqual = commonKeys.every(
        (key) => userData[key] === userDataLastSavedDate[key]
      );

      setUpdateWithNewData(!areDataEqual);

      const differentFields = commonKeys.filter(
        (key) => userData[key] !== userDataLastSavedDate[key]
      );

      setHighlightedFields(differentFields);
    } else {
      setUpdateWithNewData(false);
    }
  }, [userData, userDataLastSavedDate]);

  React.useEffect(() => {
    const diff = perfectWeight - userData.weight;
    setDifferenceFromPerfectWeight({
      difference: Math.abs(diff),
      isUnderOrAbove: userData.weight > perfectWeight ? "above" : "under"
    });
  }, [perfectWeight, userData]);

  const neckImg = useColorModeValue(neckImgDark, neckImgWhite);
  const waistImg = useColorModeValue(waistImgDark, waistImgWhite);
  const hipImg = useColorModeValue(hipImgDark, hipImgWhite);
  const [isSmallScreen] = useMediaQuery("(max-width: 767px)");
  return (
    <Box>
      {isLoading || !isTodaysDataFetched || isLoadingOnMount ? (
        <Box mt="45vh">
          <Loading />
        </Box>
      ) : (
        <DefaultAuth illustrationBackground={illustration} image={illustration}>
          <Flex
            maxW={{ base: "100%", md: "max-content" }}
            w="100%"
            mx={{ base: "auto", lg: "0px" }}
            me="auto"
            h="100%"
            alignItems="start"
            justifyContent="center"
            mb={{ base: "30px", md: "60px" }}
            px={{ base: "25px", md: "0px" }}
            mt={{ base: "40px", md: "1%" }}
            flexDirection="column"
          >
            <Box me="auto">
              <Heading color={textColor} fontSize="36px" mb="10px">
                Напишете вашите данни:
              </Heading>
              <Text
                mb="10px"
                ms="4px"
                color={textColorSecondary}
                fontWeight="400"
                fontSize="md"
                style={{ whiteSpace: "pre-line" }}
              >
                Напишете вашите данни и ние ще направим калкулации, за{" "}
                {!isSmallScreen && <br />} да определим вашето телесно
                състояние!
              </Text>
            </Box>
            <Flex
              zIndex="2"
              direction="column"
              w={{ base: "100%", md: "420px" }}
              maxW="100%"
              background="transparent"
              borderRadius="15px"
              mx={{ base: "auto", lg: "unset" }}
              me="auto"
              mb={{ base: "20px", md: "auto" }}
            >
              <Flex align="center" mb="25px">
                <HSeparator />
              </Flex>
              <FormControl>
                {Object.entries(userData).map(([key, value], index) => (
                  <Box key={key} mb="10px">
                    {key !== "gender" && key !== "goal" && (
                      <Flex alignItems="center">
                        <FormLabel
                          display="flex"
                          ms="4px"
                          fontSize="sm"
                          fontWeight="500"
                          color={textColor}
                          mb="4px"
                        >
                          {userDataPropertiesTranslated[index]
                            .charAt(0)
                            .toUpperCase() +
                            userDataPropertiesTranslated[index].slice(1)}
                          {key === "age" && (
                            <Text color={brandStars} ml="1">
                              *
                            </Text>
                          )}
                        </FormLabel>
                        <Flex alignItems="center">
                          {key === "waist" && (
                            <Image
                              src={waistImg}
                              alt="Waist Measurement"
                              boxSize="40px"
                              mb="5px"
                            />
                          )}
                          {key === "hip" && (
                            <Image
                              src={hipImg}
                              alt="Hip Measurement"
                              boxSize="40px"
                              mb="5px"
                            />
                          )}
                          {key === "neck" && (
                            <Image
                              src={neckImg}
                              alt="Neck Measurement"
                              boxSize="40px"
                              mb="5px"
                              mt="10px"
                            />
                          )}
                        </Flex>
                      </Flex>
                    )}
                    {key !== "gender" &&
                      key !== "goal" &&
                      (typeof value === "number" ? (
                        value !== 0 ? (
                          <Input
                            isRequired={key === "age"}
                            color={textColor}
                            focusBorderColor="#7551ff"
                            type="number"
                            name={key}
                            value={value || ""}
                            variant="auth"
                            placeholder={`Въведете ${userDataPropertiesTranslated[index]}`}
                            _placeholder={{ opacity: 1, color: "gray.500" }}
                            onChange={(e) => handleInputChangeWithMemory(e)}
                            fontSize="sm"
                            fontWeight="500"
                            size="lg"
                            borderColor={
                              highlightedFields.includes(key)
                                ? "green.500"
                                : undefined
                            }
                          />
                        ) : (
                          <Input
                            isRequired={key === "age"}
                            color={textColor}
                            focusBorderColor="#7551ff"
                            type="number"
                            name={key}
                            value={""}
                            variant="auth"
                            placeholder={`Въведете ${userDataPropertiesTranslated[index]}`}
                            _placeholder={{ opacity: 1, color: "gray.500" }}
                            onChange={(e) => handleInputChangeWithMemory(e)}
                            fontSize="sm"
                            fontWeight="500"
                            size="lg"
                          />
                        )
                      ) : (
                        <></>
                      ))}
                    {validationErrors[key] && (
                      <Text color="red" fontSize="sm">
                        {validationErrors[key]}
                      </Text>
                    )}
                  </Box>
                ))}
                <MeasurementsAlertDialog
                  handleSubmit={handleSubmit}
                  userData={userData}
                  checkUpdate={updateWithNewData}
                />
                {error && (
                  <Text color="red" fontSize="sm" mb="8px">
                    {error}
                  </Text>
                )}
              </FormControl>
            </Flex>
          </Flex>
        </DefaultAuth>
      )}
    </Box>
  );
};

export default UserMeasurements;
