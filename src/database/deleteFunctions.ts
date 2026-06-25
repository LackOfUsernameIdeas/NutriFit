// Импорт на функциите от Firestore
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Функция за изтриване на данни за определен ден
export const deleteDayData = async (userId: string, date: string) => {
  try {
    // Получаване на връзка с Firestore
    const firestore = getFirestore();
    const userDocRef = doc(firestore, "additionalUserData", userId);

    // Извличане на съществуващите данни
    const docSnapshot = await getDoc(userDocRef);
    const existingData = docSnapshot.exists() ? docSnapshot.data() : {};

    // Премахване на данните за указаната дата
    delete existingData[date];

    // Обновяване на документа с променените данни
    await setDoc(userDocRef, existingData);
  } catch (error) {
    console.error("Грешка при изтриване на данните от предходния ден:", error);
    throw error; // Пропагиране на грешката към извикващия код, ако е необходимо
  }
};

export const deleteFavouriteMeal = async (userId: string, meal: string) => {
  try {
    // Get Firestore reference
    const firestore = getFirestore();
    const userDataDocRef = doc(
      firestore,
      "additionalData2",
      userId,
      "dataEntries",
      "favouriteMeals"
    );

    // Fetch existing data
    const docSnapshot = await getDoc(userDataDocRef);
    const existingData = docSnapshot.exists() ? docSnapshot.data() : {};

    // Retrieve existing list of favorite meals, if any, and remove the specified meal
    const favouriteMeals = existingData.favouriteMeals || [];
    const updatedMeals = favouriteMeals.filter(
      (favMeal: string) => favMeal !== meal
    );

    // Update the document with the modified list of favorite meals
    await setDoc(userDataDocRef, { favouriteMeals: updatedMeals });
  } catch (error) {
    console.error("Error removing favourite meal:", error);
    throw error;
  }
};

// Функция за изтриване на макронутриентите и дневните калории на потребителя
export const deleteUsersMacroNutrientsAndDailyCalorieRequirements = async (
  userId: string
) => {
  try {
    // Получаване на връзка с Firestore
    const firestore = getFirestore();
    const userDocRef = doc(firestore, "additionalUserData", userId);

    // Извличане на съществуващите данни
    const docSnapshot = await getDoc(userDocRef);
    const existingData = docSnapshot.exists() ? docSnapshot.data() : {};

    // Итериране през всички дати в съществуващите данни
    for (const date of Object.keys(existingData)) {
      // Премахване на данните за дневните калории и макронутриентите за текущата дата
      delete existingData[date].dailyCaloryRequirements;
      delete existingData[date].macroNutrientsData;
    }

    // Обновяване на документа с променените данни
    await setDoc(userDocRef, existingData);
  } catch (error) {
    console.error("Грешка при изтриване на данните от предходния ден:", error);
    throw error; // Пропагиране на грешката към извикващия код, ако е необходимо
  }
};
