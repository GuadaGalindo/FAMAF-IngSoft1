import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "use-http";
import CreateGameForm from "../../components/CreateGameForm/CreateGameForm";
import { BASE_URL_ENDPOINT, options } from "../../config";
import { useValidationName } from "../../hooks/validationName";
import { getAuthToken } from "../../utils/storageManagement";

export default function CreateGameFormContainer() {
  const { name, isValid, errorMessage, validateName } = useValidationName();
  const [selectedPlayers, setSelectedPlayers] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const navigate = useNavigate();
  const token = getAuthToken();
  const { post, response } = useFetch(BASE_URL_ENDPOINT, options(token));

  // Función que se ejecuta al hacer clic en el botón "Crear".
  const handleFormSubmission = async (event) => {
    event.preventDefault();

    if (!isValid) {
      setSubmissionError("Corrige los errores antes de continuar");
      return;
    }

    // Objeto que contiene los datos del juego a enviar al servidor.
    const game_data = {
      name,
      player_amount: selectedPlayers,
      token,
    };

    // Intenta crear el juego en el backend.
    try {
      const data = await post("/games/", game_data);

      if (!response.ok) {
        throw new Error("No es posible crear la partida en este momento");
      }

      navigate(`/games/${data.id}`);
    } catch (e) {
      setSubmissionError(e.message);
    }
  };

  useEffect(() => {
    // Limpia mensajes de error anteriores.
    setSubmissionError("");
  }, [name, selectedPlayers]);

  return (
    <CreateGameForm
      errorMessage={errorMessage}
      handleFormSubmission={handleFormSubmission}
      name={name}
      setSelectedPlayers={setSelectedPlayers}
      submissionError={submissionError}
      validateName={validateName}
    />
  );
}
