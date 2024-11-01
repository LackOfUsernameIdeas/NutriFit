import React, { useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { saveGenderOnSignUp } from "database/setFunctions";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  RadioGroup,
  Radio,
  HStack,
  useColorMode,
  Checkbox
} from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

function SignUp() {
  const { colorMode } = useColorMode();
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const [show, setShow] = React.useState(false);
  const [show2, setShow2] = React.useState(false);
  const handleClick = () => setShow(!show);
  const handleClick2 = () => setShow2(!show2);
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [eulaChecked, setEulaChecked] = useState(false);

  const handleSignUp = async () => {
    try {
      if (!passwordsMatch) {
        setError("Паролите не съвпадат");
        return;
      }

      if (!eulaChecked) {
        setError(
          "Трябва да се съгласите с условията, преди да се регистрирате."
        );
        return;
      }

      const auth = getAuth();
      await setPersistence(auth, browserSessionPersistence);
      await createUserWithEmailAndPassword(auth, email, password).then(() => {
        signInWithEmailAndPassword(auth, email, password).then(() => {
          const user = auth.currentUser;
          const userId = user.uid;
          saveGenderOnSignUp(userId, gender);

          let key = sessionStorage.key(0);
          const userData = sessionStorage.getItem(key);
          let jsonUserData = JSON.parse(userData);
          let token = jsonUserData.stsTokenManager.accessToken;
          if (token) {
            history.push("/measurements/userData");
            setError("");
          } else {
            setError("Не успяхме да вземем вашия потребителски token.");
          }
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "Firebase: Error (auth/invalid-email).":
            setError(
              "Email-ът ви е невалиден. Проверете за грешки в изписването."
            );
            break;
          case "Firebase: Error (auth/email-already-exists).":
            setError(
              "Този еmail е регистриран. Да не би да искахте да влезете в профила ви?"
            );
            break;
          case "Firebase: Error (auth/invalid-password).":
            setError("Паролата ви не е правилна.");
            break;
          case "Firebase: Error (auth/missing-password).":
            setError("Моля напишете вашата парола.");
            break;
          case "Firebase: Error (auth/email-already-in-use).":
            setError(
              "Този еmail е регистриран. Да не би да искахте да влезете в профила ви?"
            );
            break;
          case "Firebase: Password should be at least 6 characters (auth/weak-password).":
            setError("Паролата ви трябва да бъде поне 6 символа.");
            break;
          default:
            setError("Грешка се случи: " + error.message);
        }
      } else {
        setError("Грешка се случи.");
      }
    }
  };

  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    if (password1 === password2) {
      setPassword(password1);
      setPasswordsMatch(true);
      setError("");
    } else {
      setError("Паролите не съвпадат");
      setPasswordsMatch(false);
    }
  }, [password1, password2]);

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <>
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
          mt={{ base: "40px", md: "14vh" }}
          flexDirection="column"
        >
          <Box me="auto">
            <Heading color={textColor} fontSize="36px" mb="10px">
              Създаване на Профил
            </Heading>
            <Text
              mb="36px"
              ms="4px"
              color={textColorSecondary}
              fontWeight="400"
              fontSize="md"
            >
              Попълнете вашият email и парола за да създадете профил!
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
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired={true}
                variant="auth"
                fontSize="sm"
                ms={{ base: "0px", md: "0px" }}
                type="email"
                placeholder="example@noit.eu"
                mb="24px"
                fontWeight="500"
                size="lg"
                onChange={(email) => setEmail(email.target.value)}
              />
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                Парола<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired={true}
                  fontSize="sm"
                  placeholder="Мин. 6 символа"
                  mb="24px"
                  size="lg"
                  type={show ? "text" : "password"}
                  variant="auth"
                  onChange={(password1) => setPassword1(password1.target.value)}
                />
                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: "pointer" }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                Потвърди Парола<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired={true}
                  fontSize="sm"
                  placeholder="Мин. 6 символа"
                  mb="24px"
                  size="lg"
                  type={show2 ? "text" : "password"}
                  variant="auth"
                  onChange={(password2) => setPassword2(password2.target.value)}
                />
                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: "pointer" }}
                    as={show2 ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick2}
                  />
                </InputRightElement>
              </InputGroup>
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                Пол
              </FormLabel>
              <Flex direction="row" mb="24px">
                <RadioGroup
                  defaultValue="male"
                  onChange={(value) => setGender(value as "male" | "female")}
                >
                  <HStack spacing="24px">
                    <Radio value="male">Мъж</Radio>
                    <Radio value="female">Жена</Radio>
                  </HStack>
                </RadioGroup>
              </Flex>
              <Flex align="center" mb="24px">
                <Checkbox
                  isChecked={eulaChecked}
                  onChange={(e) => setEulaChecked(e.target.checked)}
                  size="lg"
                  mr="10px" // Adds margin to the right for spacing
                />
                <Text
                  fontSize="sm"
                  color={textColor}
                  fontWeight="400"
                  _hover={{ textDecoration: "underline", cursor: "pointer" }} // Add hover effect
                  onClick={() => {
                    // Redirect to EULA page
                    history.push("/auth/EULA");
                  }}
                >
                  Потвърждавам, че прочетох и съм съгласен с условията.
                </Text>
              </Flex>
              <Button
                onClick={handleSignUp}
                color="white"
                bgColor="#5D4BD7"
                fontSize="sm"
                variant="brand"
                fontWeight="500"
                w="100%"
                h="50"
                mb="24px"
              >
                Създаване на Профил
              </Button>
              {error && (
                <Text color="red" fontSize="sm" mb="8px">
                  {error}
                </Text>
              )}
            </FormControl>
            <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="start"
              maxW="100%"
              mt="0px"
            >
              <Text color={textColorDetails} fontWeight="400" fontSize="14px">
                Вече имате профил?
                <NavLink to="/auth/sign-in">
                  <Text
                    color={textColorBrand}
                    as="span"
                    ms="5px"
                    fontWeight="500"
                  >
                    Влизане.
                  </Text>
                </NavLink>
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Global
          styles={`
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
              -webkit-text-fill-color: ${
                colorMode === "dark" ? "#FFF" : "#000"
              } !important; /* Set text color based on color mode */
              transition: background-color 5000s ease-in-out 0s; /* Override the transition */
            }
          `}
        />
      </>
    </DefaultAuth>
  );
}

export default SignUp;
