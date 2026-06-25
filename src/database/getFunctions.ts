import {
  getFirestore,
  getDoc,
  getDocs,
  doc,
  collection,
  query,
  orderBy,
  limit
} from "firebase/firestore";

import { Goal } from "variables/weightStats";
import { db } from "./connection";

interface UserData {
  gender?: "male" | "female" | any;
  goal?: Goal | any;
  dailyCaloryRequirements: any;
  macroNutrientsData: any;
  [date: string]: {
    Preferences: any;
    BMI: any;
    BodyMassData: any;
    PerfectWeightData: any;
    height?: number;
    age?: number;
    weight?: number;
    neck?: number;
    waist?: number;
    hip?: number;
  };
}

// Функция за извличане на допълнителни данни за потребителя
export const fetchAdditionalUserData = async (userId: string) => {
  try {
    // Получаване на референция към документа с потребителските данни
    const userDataDocRef = doc(db, "additionalData2", userId);
    const userDataSnapshot = await getDoc(userDataDocRef);

    // Проверка дали съществуват потребителски данни
    if (userDataSnapshot.exists()) {
      // Извличане на данните за потребителя
      const userData = userDataSnapshot.data();

      // Извличане на свойствата за пола и целта на потребителя
      const { gender, goal } = userData || {};

      // Получаване на референция към подколекцията с въведените данни
      const subcollectionRef = collection(userDataDocRef, "dataEntries");
      const userDocKey = new Date().toISOString().slice(0, 10);

      // Получаване на референция към документа в подколекцията, базиран на текущата дата
      const userDocRef = doc(subcollectionRef, userDocKey);

      // Извличане на данните за текущата дата
      const userDocSnapshot = await getDoc(userDocRef);
      const userDocData = userDocSnapshot.exists()
        ? userDocSnapshot.data()
        : null;

      console.log("THIS SHIT RIGHT HERE FAM -->", {
        gender,
        goal,
        [userDocKey]: userDocData
      });
      // Връщане на комбинираните данни
      return {
        gender,
        goal,
        [userDocKey]: userDocData
      } as UserData;
    } else {
      // Данните за потребителя не бяха намерени
      return null;
    }
  } catch (error) {
    console.error(
      "Грешка при извличане на допълнителни данни за потребителя:",
      error
    );
    throw error; // Пропагиране на грешката към извикващия код, ако е необходимо
  }
};

// Функция за извличане на общия брой потребители
export const getTotalUsers = async (): Promise<number> => {
  try {
    // Получаване на референция към Firestore
    const firestore = getFirestore();

    // Получаване на референция към колекцията с потребителските данни
    const usersDataCollectionRef = collection(firestore, "additionalData2");

    // Получаване на всички документи от колекцията с данни за потребителите
    const usersDataSnapshot = await getDocs(usersDataCollectionRef);

    // Връщане на общия брой потребители
    return usersDataSnapshot.size;
  } catch (error) {
    console.error("Грешка при извличане на общия брой потребители:", error);
    throw error;
  }
};

// Функция за извличане на всички планове за хранене
export const getAllMealPlans = async (): Promise<any[]> => {
  try {
    const userDataCollectionRef = collection(db, "additionalData2");
    const querySnapshot = await getDocs(userDataCollectionRef);

    const allMealPlans: any[] = [];

    // Итериране през всички документи на потребителите
    for (const userDoc of querySnapshot.docs) {
      const dataEntriesCollectionRef = collection(
        db,
        "additionalData2",
        userDoc.id,
        "dataEntries"
      );
      const dataEntriesSnapshot = await getDocs(dataEntriesCollectionRef);

      // Итериране през всички записи за данни на потребителя
      for (const entryDoc of dataEntriesSnapshot.docs) {
        const entryData = entryDoc.data();
        const entryId = entryDoc.id;

        // Проверка дали записът не е за макронутриенти или дневни калорични изисквания
        if (
          !(
            entryId.startsWith("macroNutrients_") ||
            entryId.startsWith("dailyCaloryRequirements_")
          )
        ) {
          // Добавяне на плана за хранене, ако съществува
          if (entryData.mealPlan) {
            allMealPlans.push(entryData.mealPlan);
          }
          if (entryData.mealPlanOpenAI) {
            allMealPlans.push(entryData.mealPlanOpenAI);
          }
          if (entryData.mealPlanGemini) {
            allMealPlans.push(entryData.mealPlanGemini);
          }
        }
      }
    }

    return allMealPlans;
  } catch (error) {
    console.error("Грешка при извличане на всички планове за хранене:", error);
    throw error;
  }
};

// Функция за извличане на всички здравни статуси
export const getAllHealthStatus = async (): Promise<{
  labels: string[];
  counts: number[];
}> => {
  try {
    const userDataCollectionRef = collection(db, "additionalUserData");
    const querySnapshot = await getDocs(userDataCollectionRef);

    const allHealthStatuses: string[] = [];

    // Итериране през данните на всеки потребител
    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data() as { [date: string]: { BMI: any } };

      let lastSavedDate: string | null = null;

      // Итериране през всяка дата за текущия потребител
      Object.keys(userData).forEach((date) => {
        if (isNaN(Date.parse(date))) return;

        if (!lastSavedDate || date > lastSavedDate!) {
          lastSavedDate = date;
        }
      });

      // Добавяне на здравния статус за последната запазена дата на текущия потребител
      if (lastSavedDate) {
        const lastSavedData = userData[lastSavedDate];
        if (lastSavedData.BMI) {
          allHealthStatuses.push(lastSavedData.BMI.health);
        }
      }
    });

    // Функция за броене на срещанията на елементите в масива
    const countOccurrences = (arr: string[]) => {
      const labelCounts: { [label: string]: number } = arr.reduce(
        (acc: { [key: string]: number }, curr: string) => {
          acc[curr] = (acc[curr] || 0) + 1;
          return acc;
        },
        {}
      );

      const labels = Object.keys(labelCounts);
      const counts = Object.values(labelCounts);

      return { labels, counts };
    };

    const { labels: unsortedLabels, counts: unsortedCounts } =
      countOccurrences(allHealthStatuses);

    // Сортиране на етикетите според желаната подредба
    const sortedLabels: string[] = [
      "Сериозно недохранване",
      "Средно недохранване",
      "Леко недохранване",
      "Нормално",
      "Наднормено тегло",
      "Затлъстяване I Клас",
      "Затлъстяване II Клас",
      "Затлъстяване III Клас"
    ];

    // Сортиране на броя срещания въз основа на сортираните етикети
    const sortedCounts = sortedLabels.map(
      (label) => unsortedCounts[unsortedLabels.indexOf(label)] || 0
    );

    return { labels: sortedLabels, counts: sortedCounts };
  } catch (error) {
    console.error("Грешка при извличане на всички здравни статуси:", error);
    throw error;
  }
};

// Функция за получаване на първите 50 най-добри ястия по колекция
export const getFirst50TopMealsByCollection = async (name: string) => {
  try {
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

    // Query Firestore: Order by the document name in descending order and limit to 1 document
    const mealsCollectionRef = collection(db, name);
    const q = query(
      mealsCollectionRef,
      orderBy("__name__", "desc"), // Order by the document name, which is in the format YYYY-MM-DD
      limit(1)
    );

    // Get the most recent document
    const querySnapshot = await getDocs(q);
    let mealData: any[] = [];
    let documentFound = false;

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0]; // Get the first document from the query

      const formattedDate = docSnapshot.id; // This will give us the document ID, which is the date (YYYY-MM-DD)
      const collectionName = `${formattedDate}-50`; // Create the sub-collection name

      // Reference to the sub-collection and 'meals' document
      const mealsDocRef = doc(
        collection(db, name, formattedDate, collectionName),
        "meals"
      );

      // Fetch the meals document
      const mealsDocSnap = await getDoc(mealsDocRef);

      if (mealsDocSnap.exists()) {
        mealData = mealsDocSnap.data()?.mealData;
        documentFound = true;
      }
    }

    if (!documentFound) {
      console.log("Не е намерен такъв документ в последните 30 дни!");
    }

    return mealData;
  } catch (error) {
    console.error("Грешка при извличане на най-добрите 50 ястия:", error);
    throw error;
  }
};

// Функция за получаване на първите и последните най-добри ястия по колекция
export const getFirstAndLastTopMealsByCollection = async (name: string) => {
  try {
    const currentDate = new Date();
    let mealData: any[] = [];

    // Query Firestore: Order by the document name (formatted as YYYY-MM-DD) in descending order and limit to 1
    const mealsCollectionRef = collection(db, name);
    const q = query(mealsCollectionRef, orderBy("__name__", "desc"), limit(1));

    // Get the most recent document
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0]; // The most recent document
      const formattedDate = docSnapshot.id; // Document ID, formatted as YYYY-MM-DD

      // Fetch the first 50 meals from the sub-collection `${formattedDate}-50`
      const firstCollectionName = `${formattedDate}-50`;
      const firstCollectionRef = doc(
        collection(db, name, formattedDate, firstCollectionName),
        "meals"
      );
      const firstDocSnap = await getDoc(firstCollectionRef);

      if (firstDocSnap.exists()) {
        const mealDataFromDoc = firstDocSnap.data()?.mealData;
        if (mealDataFromDoc) {
          mealData.push(...mealDataFromDoc); // Concatenate meal data to the mealData array
        }
      }

      // Fetch the last 50 meals from the sub-collection `${formattedDate}-700`
      const lastCollectionName = `${formattedDate}-700`;
      const lastCollectionRef = doc(
        collection(db, name, formattedDate, lastCollectionName),
        "meals"
      );
      const lastDocSnap = await getDoc(lastCollectionRef);

      if (lastDocSnap.exists()) {
        const mealDataFromLastDoc = lastDocSnap.data()?.mealData;
        if (mealDataFromLastDoc) {
          mealData.push(...mealDataFromLastDoc); // Concatenate meal data to the mealData array
        }
      }
    } else {
      console.log("Не са намерени такива документи в последните 30 дни!");
    }

    return mealData;
  } catch (error) {
    console.error("Грешка при извличане на най-добрите ястия:", error);
    throw error;
  }
};

export const fetchFavouriteMealsForUser = async (
  userId: string
): Promise<string[]> => {
  try {
    const userDocRef = doc(
      db,
      "additionalData2",
      userId,
      "dataEntries",
      "favouriteMeals"
    );
    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return data.favouriteMeals || []; // Return the favorite meals array if it exists
    }
    return []; // Return empty array if no favorite meals
  } catch (error) {
    console.error("Error fetching favourite meals:", error);
    throw error;
  }
};
