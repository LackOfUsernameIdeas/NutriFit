import { useState, ChangeEvent } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
  useColorModeValue
} from "@chakra-ui/react";
import FadeInWrapper from "components/wrapper/FadeInWrapper";
import Card from "components/card/Card";
import { HSeparator } from "components/separator/Separator";

export default function UserReports() {
  // Цветови стойности в зависимост от режима на цветовете
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "secondaryGray.500";
  const brandStars = useColorModeValue("brand.500", "brand.400");

  // State за съхранение на съобщението
  const [message, setMessage] = useState("");

  // Функция за обработка на промените в текстовото поле
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = event.target.value;
    // Ограничение на дължината на съобщението до 200 символа
    if (inputValue.length <= 200) {
      setMessage(inputValue);
    }
  };

  return (
    <FadeInWrapper>
      <Box
        pt={{ base: "130px", md: "80px", xl: "80px" }}
        style={{ overflow: "hidden" }}
      >
        <Box transition="0.2s ease-in-out">
          <Card
            p="20px"
            alignItems="center"
            flexDirection="column"
            w="100%"
            mb="20px"
          >
            <Text textAlign="start" fontSize="4xl" mb="10px">
              В тази страница имате възможността да направите обратна връзка!
            </Text>
            <HSeparator />
            <Text textAlign="start" fontSize="1xl" mt="20px">
              Ако намерите някакъв проблем в нашето приложение или имате
              препоръки, напишете ни и ние ще отговорим възможно най-бързо!
            </Text>
          </Card>
          <Card
            p="20px"
            alignItems="center"
            flexDirection="column"
            w="100%"
            mb="20px"
          >
            <Flex boxSize="75%">
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
                  type="email"
                  placeholder="example@noit.eu..."
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                  backgroundColor={boxBg}
                />
                <FormLabel
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  display="flex"
                >
                  Вашето име<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  type="email"
                  placeholder="Моля напишете вашето име тук..."
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                  backgroundColor={boxBg}
                />
                <FormLabel
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  display="flex"
                >
                  Вашето съобщение<Text color={brandStars}>*</Text>
                </FormLabel>
                <Textarea
                  isRequired={true}
                  variant="auth"
                  borderRadius="20px"
                  borderWidth="1px"
                  fontSize="sm"
                  placeholder="Моля напишете вашето съобщение тук..."
                  _placeholder={{
                    verticalAlign: "top",
                    color: `${textColorSecondary}`
                  }}
                  value={message}
                  onChange={handleInputChange}
                  backgroundColor={boxBg}
                  mb="24px"
                  fontWeight="500"
                  minHeight="200px"
                  size="lg"
                  maxLength={2000}
                  resize="none"
                />
                <Button
                  fontSize="sm"
                  variant="brand"
                  bgColor="#5D4BD7"
                  _hover={{ bg: "secondaryGray.900" }}
                  fontWeight="500"
                  w="100%"
                  h="50"
                  mb="24px"
                >
                  Изпратете съобщение
                </Button>
              </FormControl>
            </Flex>
          </Card>
        </Box>
      </Box>
    </FadeInWrapper>
  );
}
