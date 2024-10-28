import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Text,
  useColorModeValue
} from "@chakra-ui/react";
import Card from "components/card/Card";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { saveFavouriteMeal } from "../../database/setFunctions";
import { deleteFavouriteMeal } from "../../database/deleteFunctions";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function RecipeWidget(props: {
  image?: string;
  name: any;
  author: string;
  values: any;
}) {
  const { image, name, author, values } = props;
  const [like, setLike] = useState(false);
  const textColor = useColorModeValue("navy.700", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  useEffect(() => {
    // Fetch user's favorite meals on mount to check if this meal is liked
    const fetchFavouriteMeals = async () => {
      try {
        const userId = getAuth().currentUser?.uid;
        if (userId) {
          const db = getFirestore();
          const userDocRef = doc(db, "additionalData2", userId, "dataEntries", "favouriteMeals");
          const docSnapshot = await getDoc(userDocRef);

          // Check if the current meal is in the user's favorites
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setLike(data.favouriteMeals?.includes(author) || false);
          }
        }
      } catch (error) {
        console.error("Error fetching favourite meals:", error);
      }
    };

    fetchFavouriteMeals();
  }, [author]);

  const handleLikeClick = async () => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;

    const newLikeStatus = !like;
    setLike(newLikeStatus);

    try {
      if (newLikeStatus) {
        await saveFavouriteMeal(userId, author);
      } else {
        await deleteFavouriteMeal(userId, author);
      }
    } catch (error) {
      console.error("Error updating favourite meal:", error);
    }
  };

  return (
    <Card p="0" borderColor={borderColor} borderWidth="3px">
      <Flex direction={{ base: "column" }} justify="center">
        <Box mb={{ base: "20px", "2xl": "20px" }} position="relative">
          {image && (
            <Image
              src={image}
              w={{ base: "100%", "3xl": "100%" }}
              h={{ base: "100%", "3xl": "100%" }}
              borderRadius="20px"
              maxH={{ base: "400px" }}
              objectFit="cover"
            />
          )}
          <Button
            position="absolute"
            bg="white"
            _hover={{ bg: "whiteAlpha.900" }}
            _active={{ bg: "white" }}
            _focus={{ bg: "white" }}
            p="0px !important"
            top="14px"
            right="14px"
            borderRadius="50%"
            minW="36px"
            h="36px"
            onClick={handleLikeClick}
          >
            <Icon
              transition="0.2s linear"
              w="20px"
              h="20px"
              as={like ? IoHeart : IoHeartOutline}
              color="brand.500"
            />
          </Button>
        </Box>
        <Flex flexDirection="column" justify="space-between" h="100%">
          <Flex justify="center">
            <Text color={textColor} fontSize="lg" fontWeight="bold">
              {name}
            </Text>
          </Flex>
          <Flex justify="center" mb="20px">
            {values}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
