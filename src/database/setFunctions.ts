import { doc, runTransaction, setDoc } from "firebase/firestore";
import { SaveableDeviations } from "variables/weightStats";
import { db } from "./connection";

// Запазване на предпочитания
export const savePreferences = async (
  userId: string,
  calories?: number,
  nutrients?: any
) => {
  try {
    const newTimestampKey = new Date().toISOString().slice(0, 10);

    const userDataDocRef = doc(
      db,
      "additionalData2",
      userId,
      "dataEntries",
      newTimestampKey
    );

    await runTransaction(db, async (transaction) => {
      const docSnapshot = await transaction.get(userDataDocRef);
      const existingTimestampData = docSnapshot.exists()
        ? docSnapshot.data()
        : {};

      // Обединяване на съществуващите данни с новите данни, като запазва съществуващите свойства, ако те не са налични в новите данни
      const data = {
        ...existingTimestampData,
        Preferences: {
          Calories:
            calories !== undefined ? calories : existingTimestampData.calories,
          Carbohydrates:
            nutrients.carbs !== undefined
              ? Number(nutrients.carbs)
              : existingTimestampData.nutrients.carbs,
          Fat:
            nutrients.fat !== undefined
              ? Number(nutrients.fat)
              : existingTimestampData.nutrients.fat,
          Diet:
            nutrients.name !== undefined
              ? nutrients.name
              : existingTimestampData.nutrients.name,
          Protein:
            nutrients.protein !== undefined
              ? Number(nutrients.protein)
              : existingTimestampData.nutrients.protein
        }
      };

      // Актуализиране на документа с обединените данни
      transaction.set(userDataDocRef, data);
    });
  } catch (error) {
    console.error("Грешка при запазване на предпочитанията: ", error);
    throw error;
  }
};

// Запазване на план за хранене
export const saveMealPlan = async (
  userId: string,
  aiUsed: string,
  mealPlan: any,
  mealPlanImages: any
) => {
  try {
    const newTimestampKey = new Date().toISOString().slice(0, 10);

    const userDataDocRef = doc(
      db,
      "additionalData2",
      userId,
      "dataEntries",
      newTimestampKey
    );

    await runTransaction(db, async (transaction) => {
      const docSnapshot = await transaction.get(userDataDocRef);
      const existingTimestampData = docSnapshot.exists()
        ? docSnapshot.data()
        : {};

      // Обединяване на съществуващите данни с новите данни, като запазва съществуващите свойства, ако те не са налични в новите данни
      const data = {
        ...existingTimestampData,
        [aiUsed]: Object.keys(mealPlan).reduce((acc, mealType) => {
          (acc as any)[mealType] = Object.keys(mealPlan[mealType]).reduce(
            (mealAcc, course) => {
              (mealAcc as any)[course] = {
                ...mealPlan[mealType][course],
                image: mealPlanImages[mealType]?.[course] || "" // Вземане на съответния URL на изображението от mealPlanImages
              };
              return mealAcc;
            },
            {}
          );
          return acc;
        }, {})
      };

      // Актуализиране на документа с обединените данни
      transaction.set(userDataDocRef, data);
    });
  } catch (error) {
    console.error("Грешка при запазване на плана за хранене:", error);
    throw error;
  }
};

// Запазване на план за хранене
export const saveFavouriteMeal = async (userId: string, meal: string) => {
  try {
    // Reference a specific document (e.g., "favouriteMeals") within the "dataEntries" sub-collection
    const userDataDocRef = doc(
      db,
      "additionalData2",
      userId,
      "dataEntries",
      "favouriteMeals"
    );

    await runTransaction(db, async (transaction) => {
      const docSnapshot = await transaction.get(userDataDocRef);
      const existingData = docSnapshot.exists() ? docSnapshot.data() : {};

      // Retrieve the existing list of favorite meals, or start with an empty array if none exist
      const favouriteMeals = existingData.favouriteMeals || [];

      // Check if the meal is already in the favorites to avoid duplicates
      if (!favouriteMeals.includes(meal)) {
        favouriteMeals.push(meal); // Add the new meal to the list
      }

      // Update the document with the modified list of favorite meals
      transaction.set(userDataDocRef, { favouriteMeals });
    });
  } catch (error) {
    console.error("Error saving favourite meal:", error);
    throw error;
  }
};

// Запазване на отклонения
export const saveDeviations = async (
  userId: string,
  aiUsed: string,
  deviations: SaveableDeviations // Обект, съдържащ отклонения за калории, въглехидрати, протеини и мазнини
) => {
  try {
    const newTimestampKey = new Date().toISOString().slice(0, 10);

    const userDataDocRef = doc(
      db,
      "additionalData2",
      userId,
      "dataEntries",
      newTimestampKey
    );

    await runTransaction(db, async (transaction) => {
      const docSnapshot = await transaction.get(userDataDocRef);
      const existingTimestampData = docSnapshot.exists()
        ? docSnapshot.data()
        : {};

      // Обединяване на съществуващите отклонения с новите отклонения чрез дълбоко обединение
      const mergedDeviations = {
        ...(existingTimestampData[aiUsed] || {}), // Съществуващи отклонения, ако има такива
        deviations: deviations // Нови отклонения
      };

      // Обединяване на съществуващите данни с новите данни, като запазва съществуващите свойства, ако те не са налични в новите данни
      const data = {
        ...existingTimestampData,
        [aiUsed]: {
          ...mergedDeviations
        }
      };

      // Актуализиране на документа с обединените данни
      transaction.set(userDataDocRef, data);
    });
  } catch (error) {
    console.error("Грешка при запазване на отклоненията:", error);
    throw error;
  }
};

// Запазване на цел
export const saveGoal = async (userId: string, goal: string) => {
  try {
    const userDataDocRef = doc(db, "additionalData2", userId);

    await runTransaction(db, async (transaction) => {
      const docSnapshot = await transaction.get(userDataDocRef);
      const existingData = docSnapshot.exists() ? docSnapshot.data() : {};
      const data = {
        ...existingData,
        goal
      };

      // Актуализиране на документа с обединените данни
      transaction.set(userDataDocRef, data);
    });
  } catch (error) {
    console.error(
      "Грешка при запазване на допълнителни данни за потребителя:",
      error
    );
    throw error; // Передаване на грешката на извикващия код, ако е необходимо
  }
};

// Запазване на пол при регистрация
export const saveGenderOnSignUp = async (userId: string, gender: string) => {
  try {
    const userDocRef = doc(db, "additionalData2", userId);

    const data = {
      gender
    };

    // Актуализиране на документа с обединените данни
    await setDoc(userDocRef, data);
  } catch (error) {
    console.error(
      "Грешка при запазване на допълнителни данни за потребителя:",
      error
    );
    throw error; // Передаване на грешката на извикващия код, ако е необходимо
  }
};
