import {
  Box,
  Flex,
  List,
  ListItem,
  Link,
  Text,
  SimpleGrid,
  useColorMode,
  useColorModeValue,
  Image
} from "@chakra-ui/react";
import backgroundImageWhite from "../../assets/img/layout/layered-waves-haikei-white.svg";
import backgroundImageDark from "../../assets/img/layout/layered-waves-haikei-dark.svg";

import techStackImage from "../../assets/img/layout/techStack.jpg";
const Footer = (props: { isForLanding?: boolean }) => {
  const { isForLanding } = props;
  const { colorMode } = useColorMode();

  const footerColor = useColorModeValue("white", "#111c44");
  const textColor = useColorModeValue("black", "white");
  const backgroundImage =
    colorMode === "light" ? backgroundImageWhite : backgroundImageDark;
  return (
    <Box
      as="footer"
      bg={footerColor}
      backgroundImage={`url(${backgroundImage})`}
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      backgroundPosition="center"
      transition="background-image 0.5s ease-in-out"
      borderTop="1px solid"
      borderRadius={isForLanding ? "" : "21px"}
      borderColor={footerColor}
      py="2.5rem"
      fontSize="0.875rem"
      mt="auto"
    >
      <Box maxW="64rem" pb="2rem" mx="auto">
        <Flex flexWrap="wrap" alignItems="start" justifyContent="center">
          <SimpleGrid
            columns={{ base: 1, md: 4, lg: 4 }}
            gap={{ base: "50px", md: "100px", lg: "100px" }}
            mb="20px"
            textAlign="center"
          >
            <Box mb={{ base: "1.5rem", lg: "0" }}>
              <Text
                color={textColor}
                mb="0.5rem"
                fontSize="1.5rem"
                fontWeight="600"
                fontFamily="DM Sans"
                display="inline"
                mr="1px"
              >
                Nutri
              </Text>
              <Text
                color={textColor}
                mb="0.5rem"
                fontSize="1.5rem"
                fontWeight="600"
                fontFamily="Leckerli One"
                display="inline"
              >
                Fit
              </Text>
              <List lineHeight="2" justifyContent="center">
                <Text color="rgba(113, 128, 150, 1)" fontWeight="600">
                  НЕТИТ „Джон Атанасов”
                </Text>
                <LinkItem
                  text="ПГИ Перник"
                  href="https://pgi-pernik.bg-schools.com/"
                />
              </List>
            </Box>
            <Box mb={{ base: "1.5rem", lg: "0" }}>
              <Text
                color={textColor}
                mb="0.5rem"
                fontSize="1.5rem"
                fontWeight="600"
                display="inline"
              >
                Бързи Връзки
              </Text>
              <List lineHeight="2">
                <LinkItem text="Калкулатор за Тегло" href="/#/admin/weight" />
                <LinkItem text="Хранителен План" href="/#/admin/mealplan" />
                <LinkItem text="За Контакт" href="/#/admin/contact" />
              </List>
            </Box>
            <Box mb={{ base: "1.5rem", lg: "0" }}>
              <Text
                color={textColor}
                mb="0.5rem"
                fontSize="1.5rem"
                fontWeight="600"
                display="inline"
              >
                Източници
              </Text>
              <List lineHeight="2">
                <LinkItem
                  text="OpenAI API"
                  href="https://platform.openai.com/docs/overview"
                />
                <LinkItem
                  text="VertexAI API"
                  href="https://cloud.google.com/vertex-ai/docs/reference/rest"
                />
                <LinkItem
                  text="Chakra UI"
                  href="https://chakra-ui.com/getting-started"
                />
              </List>
            </Box>
            <Box mb={{ base: "1.5rem", lg: "0" }} position="relative">
              {" "}
              {/* Position relative for absolute positioning */}
              <Box
                boxSize="170px"
                mx="auto"
                maxWidth="100%" // Set maximum width to prevent overflow
              >
                <Image
                  src={techStackImage}
                  alt="Tech Stack"
                  width="100%"
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)" // Center the image
                />
              </Box>
            </Box>
          </SimpleGrid>
        </Flex>
      </Box>
    </Box>
  );
};

type LinkItemProps = {
  text?: string;
  isTag?: boolean;
  tagText?: string;
  href?: string;
};

const LinkItem = ({ text, isTag = false, tagText, href }: LinkItemProps) => {
  return (
    <ListItem display="flex" justifyContent="center" textAlign="center">
      {" "}
      {/* Center the content */}
      <Link
        fontWeight="600"
        href={href}
        color="rgba(113, 128, 150, 1)"
        _hover={{ color: "brand.500" }}
      >
        {text}
      </Link>
      {isTag && (
        <Text
          as="span"
          bg="#008F94"
          px="0.25rem"
          display="inline-flex"
          alignItems="center"
          color="#fff"
          height="1.25rem"
          borderRadius="0.25rem"
          ml="0.25rem"
          mt="0.25rem"
          fontSize="0.75rem"
        >
          {tagText}
        </Text>
      )}
    </ListItem>
  );
};

export default Footer;
