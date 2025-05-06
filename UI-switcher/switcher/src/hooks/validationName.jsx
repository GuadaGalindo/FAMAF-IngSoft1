import { useState } from "react";

export const useValidationName = () => {
  const [name, setName] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const validateName = (inputValue) => {
    const regexText = /^[a-zA-Z0-9]*$/; // permite letras y números (múltiples caracteres)
    const regexQty = /^.{0,20}$/; // entre 1 y 20 caracteres

    let valid = true;
    let message = "";

    // Validar caracteres
    if (!regexText.test(inputValue)) {
      valid = false;
      message = "No se permiten caracteres especiales";
    }

    // Validar cantidad de caracteres (solo si los caracteres son válidos)
    if (valid && !regexQty.test(inputValue)) {
      valid = false;
      message = "Máximo de 20 caracteres excedido";
    }

    // Actualizar el estado según la validación
    setIsValid(valid);
    setErrorMessage(message);

    setName(inputValue);
  };

  return { name, errorMessage, isValid, validateName };
};
