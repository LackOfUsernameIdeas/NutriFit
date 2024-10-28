import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Chakra imports
import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  useColorModeValue,
  useBreakpointValue
} from "@chakra-ui/react";

import MealLoading from "./LoaderMealPlan";
import FadeInWrapper from "components/wrapper/FadeInWrapper";
import { HSeparator } from "components/separator/Separator";
import {
  UserPreferencesForMealPlan,
  MealPlan2,
  UserIntakes
} from "../../../../variables/weightStats";
import UserPreferencesForMealPlanForm from "./UserPreferencesForMealPlanForm";
import MealPlanDetails from "./MealPlanDetails";
import Card from "components/card/Card";

export default function MealPlannerForm(props: {
  chosenCalories: number | null;
  chosenNutrients: {
    name: string;
    protein: number;
    fat: number;
    carbs: number;
  };
  userIntakes: UserIntakes;
  setUserIntakes?: React.Dispatch<React.SetStateAction<UserIntakes>>;
}) {
  const { chosenCalories, chosenNutrients, userIntakes, setUserIntakes } =
    props;

  const gradientLight = "linear-gradient(90deg, #422afb 0%, #715ffa 100%)";
  const gradientDark = "linear-gradient(90deg, #715ffa 0%, #422afb 100%)";
  const gradientNutri = useColorModeValue(gradientLight, gradientDark);
  const gradientFit = useColorModeValue(gradientDark, gradientLight);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPlanGeneratedWithOpenAI, setIsPlanGeneratedWithOpenAI] =
    useState(false);
  const [isPlanGeneratedWithGemini, setIsPlanGeneratedWithGemini] =
    useState(false);
  const aiUsed = isPlanGeneratedWithOpenAI
    ? "mealPlanOpenAI"
    : "mealPlanGemini";
  const [isLoading, setIsLoading] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);

  const [userPreferences, setUserPreferences] =
    useState<UserPreferencesForMealPlan>({
      Calories: 0,
      Protein: 0,
      Fat: 0,
      Carbohydrates: 0,
      Cuisine: [],
      Exclude: ""
    });

  const [mealPlan, setMealPlan] = useState<MealPlan2>({
    breakfast: null,
    lunch: null,
    dinner: null
  });
  const [mealPlanImages, setMealPlanImages] = useState<{
    breakfast: {
      main: string;
    };
    lunch: {
      appetizer: string;
      main: string;
      dessert: string;
    };
    dinner: {
      main: string;
      dessert: string;
    };
  }>({
    breakfast: null,
    lunch: null,
    dinner: null
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name !== "Cuisine" && name !== "Exclude") {
      setUserPreferences((prevPreferences) => ({
        ...prevPreferences,
        [name]: parseFloat(value)
      }));
    } else {
      setUserPreferences((prevPreferences) => ({
        ...prevPreferences,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setUserPreferences((prevState) => {
      let updatedCuisines: string | string[];
      if (typeof prevState.Cuisine === "string") {
        // If Cuisine is currently a string, convert it to an array
        updatedCuisines = prevState.Cuisine ? [prevState.Cuisine] : [];
      } else {
        // If Cuisine is already an array, use it as is
        updatedCuisines = [...prevState.Cuisine];
      }
      if (checked) {
        // Add cuisine to array if checked
        updatedCuisines.push(name);
      } else {
        // Remove cuisine from array if unchecked
        updatedCuisines = updatedCuisines.filter((c) => c !== name);
      }
      // If there's only one cuisine selected, convert it back to a string
      const updatedCuisineState =
        updatedCuisines.length === 1 ? updatedCuisines[0] : updatedCuisines;
      return {
        ...prevState,
        Cuisine: updatedCuisineState
      };
    });
  };

  useEffect(() => {
    setUserPreferences({
      Calories: chosenCalories,
      Protein: chosenNutrients.protein,
      Fat: chosenNutrients.fat,
      Carbohydrates: chosenNutrients.carbs,
      Cuisine: userPreferences.Cuisine,
      Exclude: userPreferences.Exclude
    });
  }, [chosenCalories, chosenNutrients]);

  console.log(userPreferences);

  const cuisineTranslation: { [key: string]: string } = {
    Italian: "Италианска",
    Bulgarian: "Българска",
    Spanish: "Испанска",
    French: "Френска"
  };

  function translateCuisine(
    englishCuisine: string | string[]
  ): string | string[] {
    if (Array.isArray(englishCuisine)) {
      return englishCuisine.map(
        (cuisine) => cuisineTranslation[cuisine] || cuisine
      );
    } else {
      return cuisineTranslation[englishCuisine] || englishCuisine; // Return Bulgarian translation if available, otherwise return original cuisine name
    }
  }

  const translatedCuisine: string | string[] = translateCuisine(
    userPreferences.Cuisine
  );
  let promptCuisine: string;

  if (Array.isArray(translatedCuisine)) {
    promptCuisine = translatedCuisine.join(", "); // Join multiple translated cuisine names with commas
  } else {
    promptCuisine = translatedCuisine as string; // Use the translated cuisine name
  }

  let cuisinePhrase: string;

  if (Array.isArray(userPreferences.Cuisine)) {
    if (userPreferences.Cuisine.length === 0) {
      cuisinePhrase = "всяка";
    } else if (userPreferences.Cuisine.length === 1) {
      cuisinePhrase = userPreferences.Cuisine[0];
    } else {
      cuisinePhrase = "следните";
    }
  } else {
    cuisinePhrase = userPreferences.Cuisine;
  }

  console.log("TRANSLATED --->", promptCuisine);

  const prompt = `Вие сте опитен диетолог, който наблюдава пациентите да консумират само ядлива и традиционна храна от
  ${cuisinePhrase} кухня/кухни (${promptCuisine}). Фокусирайте се върху създаването на ТОЧЕН, разнообразен и вкусен дневен хранителен план, съставен от следните ограничения: калории (${
    userPreferences.Calories
  }), протеин (${userPreferences.Protein}), мазнини (${
    userPreferences.Fat
  }) и въглехидрати (${
    userPreferences.Carbohydrates
  }). Никога не превишавайте или намалявайте предоставените лимити и се УВЕРЕТЕ, че калориите и мазнините ВИНАГИ са същите като предоставените лимити. 
    Осигурете точността на количествата, като същевременно се придържате към лимитите. 
    Уверете се, че предоставените от вас хранения се различават от тези, които сте предоставили в предишни заявки. Давай винаги нови и вкусни храни, така че винаги да се създаде уникално и разнообразно меню.
    Експортирайте в JSON ТОЧНО КАТО ПРЕДОСТАВЕНАТА СТРУКТУРА в съдържанието на този заявка, без да добавяте 'json' ключова дума с обратни кавички. 
    Отговорът трябва да бъде чист JSON, нищо друго. Това означава, че вашият отговор не трябва да започва с 'json*backticks*{data}*backticks*' или '*backticks*{data}*backticks*'.
    Създайте ми дневно меню с ниско съдържание на мазнини, включващо едно ястие за закуска, три за обяд (третото трябва да е десерт) и две за вечеря (второто да бъде десерт). 
    Менюто трябва стриктно да спазва следните лимити: да съдържа ${
      userPreferences.Calories
    } калории, ${userPreferences.Protein} грама протеин, ${
    userPreferences.Fat
  } грама мазнини и ${userPreferences.Carbohydrates} грама въглехидрати. 
    НЕ Предоставяйте храни, които накрая имат значително по-малко количество калории, въглехидрати, протеин и мазнини в сравнение с посочените общи лимити (${
      userPreferences.Calories
    } калории, ${userPreferences.Protein} грама протеин, ${
    userPreferences.Fat
  } грама мазнини и ${
    userPreferences.Carbohydrates
  } грама въглехидрати) и НИКОГА, АБСОЛЮТНО НИКОГА не давай хранителен план, чийто сумирани стойности са с отклонение от лимитите на потребителя - 100 калории, 10 грама протеини, 20 грама въглехидрати, 10 грама мазнини. ДАВАЙ ВСЕКИ ПЪТ РАЗЛИЧНИ храни, а не еднакви или измислени рецепти.
    Включвай само съществуващи в реалния свят храни в хранителния план. Предоставете точни мерки и точни стойности за калории, протеин, въглехидрати и мазнини за закуска, обяд, вечеря и общо. Включете само реалистични храни за консумация. 
    Подсигури рецепти за приготвянето на храните и нужните продукти(съставки) към всяко едно ястие. Направи рецептите и съставките, така че да се получи накрая точното количество, което ще се яде, не повече от това.
    Имената на храните трябва да бъдат адекватно преведени и написани на български език и да са реални ястия за консумация. 
    ${
      userPreferences.Exclude &&
      `Добави всички останали условия към менюто, но се увери, че избягваш стриктно да включваш следните елементи в менюто на храните: ${userPreferences.Exclude}. 
      Съобрази се с начина на приготвяне и рецептите вече като имаш в предвид какво НЕ ТРЯБВА да се включва.`
    }
    Имената на храните трябва да са адекватно преведени и написани, така че да са съществуващи храни. 
    Форматирай общата информацията за калориите, протеина, въглехидратите и мазнините по следния начин И ВНИМАВАЙ ТЯ ДА НЕ Е РАЗЛИЧНА ОТ ОБЩАТА СТОЙНОСТ НА КАЛОРИИТЕ, ВЪГЛЕХИДРАТИТЕ, ПРОТЕИНА И МАЗНИНИТЕ НА ЯСТИЯТА: 'totals: {'calories': number,'protein': number,'fat': number,'carbohydrates': number,'grams':number}'. 
    Форматирай ЦЯЛАТА информация във валиден JSON точно така: 
    "'breakfast':{
        'main':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)}
      },
      'lunch':{
        'appetizer':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)}, 
        'main':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)}, 
        'dessert':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)}
      }, 
      'dinner':{
        'main':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)}, 
        'dessert':{'name':'string','totals':{'calories':number,'protein':number,'fat':number,'carbohydrates':number,'grams':number}, 'ingredients':['quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient','quantity ingredient'...], 'instructions':['1.string','2.string','3.string','4.string'...], 'recipeQuantity': number (in grams)}
      }", като не превеждаш имената на нито едно property (ТЕ ТРЯБВА ДА СА САМО НА АНГЛИЙСКИ ЕЗИК). 
    Съобрази се с подадената структура когато връщаш твоя отговор и където пише number, НЕ връщай string! Не добавяй излишни кавички или думи, JSON формата трябва да е валиден. 
    Преведи САМО стойностите на БЪЛГАРСКИ, без нито едно property. Те трябва ЗАДЪЛЖИТЕЛНО да са на английски. 
    Грамажът на ястията е ЗАДЪЛЖИТЕЛНА стойност, която НЕ трябва да е повече от 500 грама. Не включвай грамажа в името на ястието, а го дай САМО като стойност в totals. 
    Името на ястието трябва да е ЗАДЪЛЖИТЕЛНО на български, а не на искапнски или друг език.`;

  const promptGemini = `Вие сте опитен диетолог, който наблюдава пациентите да консумират само ядлива и традиционна храна от
  ${cuisinePhrase} кухня/кухни (${promptCuisine}). Фокусирайте се върху създаването на ТОЧЕН, разнообразен и вкусен дневен хранителен план, съставен от следните ограничения: калории (${
    userPreferences.Calories
  }), протеин (${userPreferences.Protein}), мазнини (${
    userPreferences.Fat
  }) и въглехидрати (${
    userPreferences.Carbohydrates
  }). Никога не превишавайте или намалявайте предоставените лимити и се УВЕРЕТЕ, че калориите и мазнините ВИНАГИ са същите като предоставените лимити. 
    Осигурете точността на количествата, като същевременно се придържате към лимитите. 
    Уверете се, че предоставените от вас хранения се различават от тези, които сте предоставили в предишни заявки. Давай винаги нови и вкусни храни, така че винаги да се създаде уникално и разнообразно меню.
    Експортирайте в JSON ТОЧНО КАТО ПРЕДОСТАВЕНАТА СТРУКТУРА в съдържанието на този заявка, без да добавяте 'json' ключова дума с обратни кавички. 
    Отговорът трябва да бъде чист JSON, нищо друго. Това означава, че вашият отговор не трябва да започва с 'json*backticks*{data}*backticks*' или '*backticks*{data}*backticks*'.
    Създайте ми дневно меню с ниско съдържание на мазнини, включващо САМО ЕДНО ястие за закуска, ТРИ за обяд (третото трябва да е десерт) и ДВЕ за вечеря (второто да бъде десерт). 
    Менюто трябва стриктно да спазва следните лимити: да съдържа ${
      userPreferences.Calories
    } калории, ${userPreferences.Protein} грама протеин, ${
    userPreferences.Fat
  } грама мазнини и ${userPreferences.Carbohydrates} грама въглехидрати. 
    НЕ Предоставяйте храни, които накрая имат значително по-малко количество калории, въглехидрати, протеин и мазнини в сравнение с посочените общи лимити (${
      userPreferences.Calories
    } калории, ${userPreferences.Protein} грама протеин, ${
    userPreferences.Fat
  } грама мазнини и ${
    userPreferences.Carbohydrates
  } грама въглехидрати) и НИКОГА, АБСОЛЮТНО НИКОГА не давай хранителен план, чийто сумирани стойности са с отклонение от лимитите на потребителя - 100 калории, 10 грама протеини, 20 грама въглехидрати, 10 грама мазнини. ДАВАЙ ВСЕКИ ПЪТ РАЗЛИЧНИ храни, а не еднакви или измислени рецепти.
    Включвай само съществуващи в реалния свят храни в хранителния план. Предоставете точни мерки и точни стойности за калории, протеин, въглехидрати и мазнини за закуска, обяд, вечеря и общо. Включете само реалистични храни за консумация. 
    Подсигури рецепти за приготвянето на храните и нужните продукти(съставки) към всяко едно ястие. Направи рецептите и съставките, така че да се получи накрая точното количество, което ще се яде, не повече от това.
    Имената на храните трябва да бъдат адекватно преведени и написани на български език и да са реални ястия за консумация. 
    ${
      userPreferences.Exclude &&
      `Добави всички останали условия към менюто, но се увери, че избягваш стриктно да включваш следните елементи в менюто на храните: ${userPreferences.Exclude}. 
      Съобрази се с начина на приготвяне и рецептите вече като имаш в предвид какво НЕ ТРЯБВА да се включва.`
    }
    Имената на храните трябва да са адекватно преведени и написани, така че да са съществуващи храни. 
    Форматирай общата информацията за калориите, протеина, въглехидратите и мазнините по следния начин И ВНИМАВАЙ ТЯ ДА НЕ Е РАЗЛИЧНА ОТ ОБЩАТА СТОЙНОСТ НА КАЛОРИИТЕ, ВЪГЛЕХИДРАТИТЕ, ПРОТЕИНА И МАЗНИНИТЕ НА ЯСТИЯТА: 'totals: {'calories': number,'protein': number,'fat': number,'carbohydrates': number,'grams':number}'. 
    Форматирай ЦЯЛАТА информация във валиден JSON точно така: 
    {
    "breakfast":{
      "main":{"name":"string","totals":{"calories":number,"protein":number,"fat":number,"carbohydrates":number,"grams":number}, "ingredients":["quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient"...], "instructions":["1.string","2.string","3.string","4.string"...], "recipeQuantity": number (in grams)}
    },
    "lunch":{
      "appetizer":{"name":"string","totals":{"calories":number,"protein":number,"fat":number,"carbohydrates":number,"grams":number}, "ingredients":["quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient"...], "instructions":["1.string","2.string","3.string","4.string"...], "recipeQuantity": number (in grams)}, 
      "main":{"name":"string","totals":{"calories":number,"protein":number,"fat":number,"carbohydrates":number,"grams":number}, "ingredients":["quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient"...], "instructions":["1.string","2.string","3.string","4.string"...], "recipeQuantity": number (in grams)}, 
      "dessert":{"name":"string","totals":{"calories":number,"protein":number,"fat":number,"carbohydrates":number,"grams":number}, "ingredients":["quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient"...], "instructions":["1.string","2.string","3.string","4.string"...], "recipeQuantity": number (in grams)}
    }, 
    "dinner":{
      "main":{"name":"string","totals":{"calories":number,"protein":number,"fat":number,"carbohydrates":number,"grams":number}, "ingredients":["quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient"...], "instructions":["1.string","2.string","3.string","4.string"...], "recipeQuantity": number (in grams)}, 
      "dessert":{"name":"string","totals":{"calories":number,"protein":number,"fat":number,"carbohydrates":number,"grams":number}, "ingredients":["quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient","quantity ingredient"...], "instructions":["1.string","2.string","3.string","4.string"...], "recipeQuantity": number (in grams)}
    },
    } като не превеждаш имената на нито едно property (ТЕ ТРЯБВА ДА СА САМО НА АНГЛИЙСКИ ЕЗИК, ТОВА ВКЛЮЧВА: "breakfast", "lunch", "dinner", "appetizer", "main", "dessert", "name", "ingredients" и "instructions"!!!). 
    Съобрази се с подадената структура когато връщаш твоя отговор и където пише number, НЕ връщай string! Не добавяй излишни кавички или думи, JSON формата трябва да е валиден за JavaScript JSON.parse(). 
    Преведи САМО стойностите на БЪЛГАРСКИ, без нито едно property. Те трябва ЗАДЪЛЖИТЕЛНО да са на английски. 
    Грамажът на ястията е ЗАДЪЛЖИТЕЛНА стойност, която НЕ трябва да е повече от 500 грама. Не включвай грамажа в името на ястието, а го дай САМО като стойност в totals. 
    Името на ястието трябва да е ЗАДЪЛЖИТЕЛНО на български, а не на искапнски или друг език.`;

  // Hosting: REACT_APP_API_KEY_HOSTING
  const openAIKey = process.env.REACT_APP_API_KEY_HOSTING;
  const generatePlanWithOpenAI = async () => {
    try {
      setIsSubmitted(true);
      setRequestFailed(false);
      setIsPlanGeneratedWithOpenAI(true);
      setIsPlanGeneratedWithGemini(false);
      setIsLoading(true);
      console.log("PROMPT --->", prompt);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAIKey}`
          },
          body: JSON.stringify({
            model: "gpt-4-0125-preview",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
          })
        }
      );

      if (!response.ok) {
        setRequestFailed(true);
        setIsLoading(false);
        throw new Error("Failed to generate meal plan");
      }

      const responseData = await response.json();
      console.log("responseData: ", responseData);
      const responseJson = responseData.choices[0].message.content;
      // Process the data returned by OpenAI API
      const unescapedData = responseJson
        .replace(/^```json([\s\S]*?)```$/, "$1")
        .replace(/^```JSON([\s\S]*?)```$/, "$1")
        .replace(/^```([\s\S]*?)```$/, "$1")
        .replace(/^'|'$/g, "") // Remove single quotes at the beginning and end
        .trim();
      console.log("unescapedData: ", unescapedData);
      const escapedData = decodeURIComponent(unescapedData);
      console.log("escapedData: ", escapedData);
      let data;
      try {
        data = JSON.parse(escapedData);
        checkTotals(data);
      } catch (parseError) {
        throw new Error("Invalid JSON response from the server");
      }

      if (!isValidJson(data)) {
        throw new Error("Invalid JSON structure");
      }

      console.log("CHATGPT: ", data);

      const filteredArr = Object.fromEntries(
        Object.entries(data).filter(([key]) => key !== "totals")
      );

      const mealPlanImagesData: {
        breakfast: {
          main: string;
        };
        lunch: {
          appetizer: string;
          main: string;
          dessert: string;
        };
        dinner: {
          main: string;
          dessert: string;
        };
      } = {
        breakfast: {
          main: ""
        },
        lunch: {
          appetizer: "",
          main: "",
          dessert: ""
        },
        dinner: {
          main: "",
          dessert: ""
        }
      };
      const updatedMealPlanImagesData: any = {}; // Initialize a variable to hold updated meal plan images data
      const updatedMealPlan: any = {};
      // Iterate over each meal and make a separate image generation request
      for (const mealKey of Object.keys(filteredArr)) {
        const mealAppetizer = (filteredArr as any)[mealKey].appetizer;
        const mealMain = (filteredArr as any)[mealKey].main;
        const mealDessert = (filteredArr as any)[mealKey].dessert;

        // console.log("meal: ", meal);
        // console.log("meal name: ", meal.name);

        //NutriFit: cx=10030740e88c842af, key=AIzaSyDqUez1TEmLSgZAvIaMkWfsq9rSm0kDjIw
        //NutriFit2: cx=258e213112b4b4492, key=AIzaSyArE48NFh1befjjDxpSrJ0eBgQh_OmQ7RA
        //NutriFit3: cx=527000b0fabcc4dab, key=AIzaSyDwqaIBGxmhEc6GVR3lwOVk_-0EpwKvOPA
        // Now make a request to the google images search engine endpoint for each meal's name
        async function fetchImage(name: string): Promise<any> {
          try {
            let response = await fetch(
              `https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyAefnCBUG8640RF8b2pd1cWyS6ZBXBXIeQ&cx=10030740e88c842af&q=${encodeURIComponent(
                name
              )}&searchType=image`
            );
            if (response.status === 429) {
              let response = await fetch(
                `https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyB27VKeq5GAyeI0mNSZprT9nY0ttgkXnFI&cx=258e213112b4b4492&q=${encodeURIComponent(
                  name
                )}&searchType=image`
              );
              return response;
            } else {
              return response;
            }
          } catch (error) {
            console.error("Error fetching image:", error);
            return null;
          }
        }

        const imageAppetizer =
          mealKey === "lunch" ? await fetchImage(mealAppetizer.name) : null;

        const imageMain = await fetchImage(mealMain.name);

        const imageDessert =
          mealKey === "lunch" || mealKey === "dinner"
            ? await fetchImage(mealDessert.name)
            : null;

        const imageAppetizerResponseData =
          imageAppetizer !== null ? await imageAppetizer.json() : null;
        const imageMainResponseData = await imageMain.json();
        const imageDessertResponseData =
          imageDessert !== null ? await imageDessert.json() : null;

        console.log("imageDessert: ", imageDessert, mealKey);
        // console.log(
        //   `Image Generation Response for ${mealAppetizer.name}: `,
        //   imageAppetizerResponseData.items[0].link
        // );
        if (
          imageAppetizerResponseData !== null &&
          imageAppetizerResponseData?.items?.[0]?.link
        ) {
          (mealPlanImagesData as any)[mealKey].appetizer =
            imageAppetizerResponseData.items[0].link;
        }

        if (imageMainResponseData?.items?.[0]?.link) {
          (mealPlanImagesData as any)[mealKey].main =
            imageMainResponseData.items[0].link;
        }

        if (
          imageDessertResponseData !== null &&
          imageDessertResponseData?.items?.[0]?.link
        ) {
          (mealPlanImagesData as any)[mealKey].dessert =
            imageDessertResponseData.items[0].link;
        }
        updatedMealPlanImagesData[mealKey] = {
          appetizer: imageAppetizerResponseData?.items?.[0]?.link || "",
          main: imageMainResponseData.items[0].link,
          dessert: imageDessertResponseData?.items?.[0]?.link || ""
        };

        // Set updated meal plan
        updatedMealPlan[mealKey] = {
          appetizer: data[mealKey].appetizer,
          main: data[mealKey].main,
          dessert: data[mealKey].dessert
        };
      }

      setMealPlanImages(updatedMealPlanImagesData);
      setMealPlan({
        breakfast: updatedMealPlan.breakfast,
        lunch: updatedMealPlan.lunch,
        dinner: updatedMealPlan.dinner
      });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setRequestFailed(true);
      console.error("Error generating meal plan:", error);
    }
  };

  function checkTotals(obj: any) {
    // Check if the object is an array
    if (Array.isArray(obj)) {
      obj.forEach((item) => checkTotals(item));
    } else if (typeof obj === "object" && obj !== null) {
      // Check if the object is an object (excluding null)
      // Check if the object has a "totals" property
      if (obj.hasOwnProperty("totals")) {
        for (let key in obj.totals) {
          if (typeof obj.totals[key] !== "number") {
            throw new Error(
              `Invalid value for ${key} in totals: Expected a number`
            );
          }
        }
      }
      // Recursively check the nested objects
      for (let key in obj) {
        checkTotals(obj[key]);
      }
    }
  }

  const isValidJson = (jsonObject: MealPlan2) => {
    return (
      jsonObject &&
      jsonObject.breakfast &&
      jsonObject.lunch &&
      jsonObject.dinner
    );
  };

  const generatePlanWithGemini = async () => {
    try {
      setIsSubmitted(true);
      setRequestFailed(false);
      setIsPlanGeneratedWithGemini(true);
      setIsPlanGeneratedWithOpenAI(false);
      setIsLoading(true);
      console.log("PROMPT --->", prompt);
      const response = await fetch(
        "https://nutri-api.noit.eu/geminiGenerateResponse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "349f35fa-fafc-41b9-89ed-ff19addc3494"
          },
          body: JSON.stringify({ text: promptGemini })
        }
      );

      const responseData = await response.json();
      const responseJson = responseData.aiResponse;
      console.log("Response from backend:", responseJson);

      const stringToRepair = responseJson
        .replace(/^```json([\s\S]*?)```$/, "$1")
        .replace(/^```JSON([\s\S]*?)```$/, "$1")
        .replace(/^```([\s\S]*?)```$/, "$1")
        .replace(/^'|'$/g, "")
        .trim();
      let jsonObject;
      try {
        console.log("stringToRepair: ", stringToRepair);
        jsonObject = JSON.parse(stringToRepair);
        checkTotals(jsonObject);
        console.log("jsonObject11111: ", jsonObject);
      } catch (parseError) {
        throw new Error("Invalid JSON response from the server");
      }
      if (!isValidJson(jsonObject)) {
        throw new Error("Invalid JSON structure");
      }

      console.log("jsonObject: ", jsonObject);
      const mealPlanImagesData: {
        breakfast: {
          main: string;
        };
        lunch: {
          appetizer: string;
          main: string;
          dessert: string;
        };
        dinner: {
          main: string;
          dessert: string;
        };
      } = {
        breakfast: {
          main: ""
        },
        lunch: {
          appetizer: "",
          main: "",
          dessert: ""
        },
        dinner: {
          main: "",
          dessert: ""
        }
      };
      const updatedMealPlanImagesData: any = {};
      const updatedMealPlan: any = {};
      for (const mealKey of Object.keys(jsonObject)) {
        if (mealKey !== "totals") {
          const mealAppetizer = (jsonObject as any)[mealKey].appetizer;
          const mealMain = (jsonObject as any)[mealKey].main;
          const mealDessert = (jsonObject as any)[mealKey].dessert;

          // console.log("meal: ", meal);
          // console.log("meal name: ", meal.name);

          //NutriFit: cx=10030740e88c842af, key=AIzaSyDqUez1TEmLSgZAvIaMkWfsq9rSm0kDjIw
          //NutriFit2: cx=258e213112b4b4492, key=AIzaSyArE48NFh1befjjDxpSrJ0eBgQh_OmQ7RA
          //NutriFit3: cx=527000b0fabcc4dab, key=AIzaSyDwqaIBGxmhEc6GVR3lwOVk_-0EpwKvOPA
          // Now make a request to the google images search engine endpoint for each meal's name
          async function fetchImage(name: string): Promise<any> {
            try {
              let response = await fetch(
                `https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyAefnCBUG8640RF8b2pd1cWyS6ZBXBXIeQ&cx=10030740e88c842af&q=${encodeURIComponent(
                  name
                )}&searchType=image`
              );
              if (response.status === 429) {
                let response = await fetch(
                  `https://customsearch.googleapis.com/customsearch/v1?key=AIzaSyB27VKeq5GAyeI0mNSZprT9nY0ttgkXnFI&cx=258e213112b4b4492&q=${encodeURIComponent(
                    name
                  )}&searchType=image`
                );
                return response;
              } else {
                return response;
              }
            } catch (error) {
              console.error("Error fetching image:", error);
              return null;
            }
          }
          const imageAppetizer =
            mealKey === "lunch" ? await fetchImage(mealAppetizer.name) : null;
          const imageMain = await fetchImage(mealMain.name);
          const imageDessert =
            mealKey === "lunch" || mealKey === "dinner"
              ? await fetchImage(mealDessert.name)
              : null;
          const imageAppetizerResponseData =
            imageAppetizer !== null ? await imageAppetizer.json() : null;
          const imageMainResponseData = await imageMain.json();
          const imageDessertResponseData =
            imageDessert !== null ? await imageDessert.json() : null;
          // Check if the response data is not null and has items array
          if (
            imageAppetizerResponseData !== null &&
            Array.isArray(imageAppetizerResponseData.items) &&
            imageAppetizerResponseData.items.length > 0 &&
            imageAppetizerResponseData?.items[0]?.link
          ) {
            (mealPlanImagesData as any)[mealKey].appetizer =
              imageAppetizerResponseData?.items[0]?.link;
          }
          if (
            imageDessertResponseData !== null &&
            Array.isArray(imageDessertResponseData.items) &&
            imageDessertResponseData.items.length > 0 &&
            imageDessertResponseData?.items[0]?.link
          ) {
            (mealPlanImagesData as any)[mealKey].dessert =
              imageDessertResponseData?.items[0]?.link;
          }
          updatedMealPlanImagesData[mealKey] = {
            appetizer: imageAppetizerResponseData?.items?.[0]?.link || "",
            main: imageMainResponseData?.items?.[0]?.link || "", // Add a null check before accessing items
            dessert: imageDessertResponseData?.items?.[0]?.link || ""
          };
          // Set updated meal plan
          updatedMealPlan[mealKey] = {
            appetizer: jsonObject[mealKey].appetizer,
            main: jsonObject[mealKey].main,
            dessert: jsonObject[mealKey].dessert
          };
        }
      }
      setMealPlanImages(updatedMealPlanImagesData);
      setMealPlan({
        breakfast: updatedMealPlan.breakfast,
        lunch: updatedMealPlan.lunch,
        dinner: updatedMealPlan.dinner
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setRequestFailed(true);
      console.error("Error generating meal plan:", error);
    }
  };

  console.log("mealPlan: ", mealPlan);
  console.log("mealPlanImages: ", mealPlanImages);
  // const filteredArr = Object.keys(mealPlan).map((mealType: any, index) => {
  //   console.log((mealPlan as any)[mealType]?.name, index);
  // });
  // console.log("filteredArr: ", filteredArr);

  interface LinearGradientTextProps {
    text: any;
    gradient: string;
    fontSize?: string;
    fontFamily?: string;
    mr?: string;
  }

  const LinearGradientText: React.FC<LinearGradientTextProps> = ({
    text,
    gradient,
    fontSize,
    fontFamily,
    mr
  }) => (
    <Text
      as="span"
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontWeight="bold"
      mr={mr}
      style={{
        backgroundImage: gradient,
        WebkitBackgroundClip: "text",
        color: "transparent"
      }}
    >
      {text}
    </Text>
  );

  const fontSize = useBreakpointValue({ base: "3xl", md: "5xl" });

  return (
    <FadeInWrapper>
      <Box mb="20px">
        <Card>
          <Flex
            justify="center"
            w="100%"
            mb="5px"
            flexWrap="wrap"
            textAlign="center"
          >
            <Text fontSize={fontSize} mr="2">
              Създайте хранителен план с
            </Text>
            <LinearGradientText
              text={<b>Nutri</b>}
              gradient={gradientNutri}
              fontSize={fontSize}
              fontFamily="DM Sans"
              mr="1px" // Adjust the margin as needed
            />
            <LinearGradientText
              text={<b>Fit</b>}
              gradient={gradientFit}
              fontFamily="Leckerli One"
              fontSize={fontSize}
            />
            <Text fontSize={fontSize}>:</Text>
          </Flex>
          <HSeparator />
          <Card>
            {isSubmitted ? (
              <Box>
                {isLoading ? (
                  <>
                    <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap="20px">
                      <UserPreferencesForMealPlanForm
                        userPreferences={userPreferences}
                        handleInputChange={handleInputChange}
                        handleCheckboxChange={handleCheckboxChange}
                        generatePlanWithOpenAI={generatePlanWithOpenAI}
                        generatePlanWithGemini={generatePlanWithGemini}
                      />
                    </SimpleGrid>
                    <MealLoading />
                  </>
                ) : (
                  <>
                    <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap="20px">
                      <UserPreferencesForMealPlanForm
                        userPreferences={userPreferences}
                        handleInputChange={handleInputChange}
                        handleCheckboxChange={handleCheckboxChange}
                        generatePlanWithOpenAI={generatePlanWithOpenAI}
                        generatePlanWithGemini={generatePlanWithGemini}
                      />
                    </SimpleGrid>
                    {mealPlan.dinner !== null && requestFailed == false ? (
                      <Flex justify="center" w="100%" mb="5px">
                        <SimpleGrid
                          columns={{ base: 1, md: 1, xl: 1 }}
                          gap="20px"
                        >
                          <MealPlanDetails
                            mealPlan={mealPlan}
                            mealPlanImages={mealPlanImages}
                            userPreferences={userPreferences}
                            isPlanGeneratedWithOpenAI={
                              isPlanGeneratedWithOpenAI
                            }
                          />
                        </SimpleGrid>
                      </Flex>
                    ) : (
                      <Text
                        textAlign="center"
                        fontSize="4xl"
                        mt="20px"
                        transition="0.25s ease-in-out"
                      >
                        Не намерихме хранителен план за вас :( Опитайте отново.
                      </Text>
                    )}
                  </>
                )}
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap="20px">
                <UserPreferencesForMealPlanForm
                  userPreferences={userPreferences}
                  handleInputChange={handleInputChange}
                  handleCheckboxChange={handleCheckboxChange}
                  generatePlanWithOpenAI={generatePlanWithOpenAI}
                  generatePlanWithGemini={generatePlanWithGemini}
                />
              </SimpleGrid>
            )}
          </Card>
        </Card>
      </Box>
    </FadeInWrapper>
  );
}
