import React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useMediaQuery
} from "@chakra-ui/react";
import { useDisclosure, Button } from "@chakra-ui/react";

import { UserData } from "../../../variables/weightStats";

/**
 * Компонент за показване на диалогов прозорец за измервания.
 * @param {Object} props - Свойства на компонента.
 * @param {function} props.handleSubmit - Функция, която се извиква при изпращане на данните.
 * @param {UserData} props.userData - Обект с данни на потребителя.
 * @param {boolean} props.checkUpdate - Показва дали е актуализация.
 */
function MeasurementsAlertDialog(props: {
  handleSubmit: (event: React.FormEvent) => void;
  userData: UserData;
  checkUpdate: boolean;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [valuesToCheck, setValuesToCheck] = React.useState({
    height: 0,
    age: 0,
    weight: 0,
    neck: 0,
    waist: 0,
    hip: 0
  });
  const [buttonText, setButtonText] = React.useState<string>(
    props.checkUpdate ? "Актуализирайте" : "Изпратете"
  );

  React.useEffect(() => {
    // Зарежда последно запазените данни от Local Storage
    const storedValues = JSON.parse(
      localStorage.getItem("lastTypedValues") || "{}"
    );

    // Проверка дали съхранените стойности се различават от текущите valuesToCheck
    if (
      !Object.keys(storedValues).every(
        (key) =>
          storedValues[key] === valuesToCheck[key as keyof typeof valuesToCheck]
      )
    ) {
      // Ако са различни, актуализирайте стойностите за проверка
      setValuesToCheck(storedValues as typeof valuesToCheck);
    }
  }, [props.userData]);

  React.useEffect(() => {
    console.log("checkUpdate value:", props.checkUpdate);

    if (props.checkUpdate) {
      setButtonText("Актуализирайте");
    } else {
      setButtonText("Изпратете");
    }
  }, [props.checkUpdate]);

  /**
   * Превежда ключа на български.
   * @param {string} key - Ключ за превод.
   * @returns {string} - Преведеният текст.
   */
  const translateKey = (key: any) => {
    // Заменете тази логика с вашата реална логика за превод
    // За простота, да приемем, че имаме прост превод за демонстрационни цели
    switch (key) {
      case "height":
        return "Височина";
      case "age":
        return "Възраст";
      case "weight":
        return "Тегло";
      case "neck":
        return "Обиколка на врат";
      case "waist":
        return "Обиколка на талия";
      case "hip":
        return "Oбиколка на таз";
      default:
        return key;
    }
  };

  const handleOpen = () => {
    onOpen();
  };

  const handleConfirm = (event: React.FormEvent) => {
    props.handleSubmit(event);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const [isSmallScreen] = useMediaQuery("(max-width: 767px)");

  return (
    <>
      <Button
        onClick={handleOpen}
        fontSize="sm"
        bgColor="#5D4BD7"
        variant="brand"
        fontWeight="500"
        w="100%"
        h="50"
        mb="24px"
      >
        {buttonText}
      </Button>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            borderRadius="25px"
            mx={isSmallScreen ? "20px" : 0}
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Потвърждение
            </AlertDialogHeader>

            <AlertDialogCloseButton />

            <AlertDialogBody>
              Моля, проверете дали сте на път да регистрирате правилните си
              данни:
            </AlertDialogBody>

            <AlertDialogBody>
              {Object.entries(valuesToCheck).map(([key, value]) => (
                <p key={key}>
                  {translateKey(key as any)}: {value}
                </p>
              ))}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={handleClose}
                fontSize="sm"
                fontWeight="500"
                w="100%"
                h="50"
                mb="24px"
              >
                Назад
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirm}
                ml={3}
                fontSize="sm"
                variant="brand"
                bgColor="#5D4BD7"
                fontWeight="500"
                w="100%"
                h="50"
                mb="24px"
              >
                Потвърждение
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default MeasurementsAlertDialog;
