import { useState } from "react";
import { Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useFetch from "use-http";
import FormButton from "../../components/Form/FormButton";
import FormInput from "../../components/Form/FormInput";
import { BASE_URL_ENDPOINT, options } from "../../config";
import { useValidationName } from "../../hooks/validationName";
import { setAuthToken, setPlayerId } from "../../utils/storageManagement";
import "./home.css";

export const Home = () => {
  const { name, errorMessage, isValid, validateName } = useValidationName();
  const [submissionError, setSubmissionError] = useState("");
  const navigate = useNavigate();
  const { post, response } = useFetch(BASE_URL_ENDPOINT, options());

  // function to handle button click
  const handleFormSubmission = async (event) => {
    event.preventDefault();

    if (!isValid) {
      setSubmissionError("Corrige los errores antes de continuar");
      return;
    }

    // send player name to the backend
    try {
      const data = await post("/players", { name });

      if (!response.ok) {
        throw new Error("No es posible crear el jugador en este momento");
      }

      setAuthToken(data.token);
      setPlayerId(data.id);
      navigate("/games");
    } catch (e) {
      setSubmissionError(e.message);
    }
  };

  return (
    <>
      <Container className="d-flex flex-column justify-content-center align-items-center flex-grow-1 text-center">
        <div className="w-100 mb-3">
          <div className="title-upper-line mb-1"></div>
          <div className="title-container">
            <span className="title">EL SWITCHER</span>
          </div>
          <div className="title-bottom-line mt-1"></div>
        </div>
        <div className="w-50 mb-5">
          <div className="subtitle-upper-line"></div>
          <div className="subtitle-container">
            <span className="subtitle">UN JUEGO DE INGENIO Y ESTRATEGIA</span>
          </div>
          <div className="subtitle-bottom-line"></div>
        </div>
        <Form className="w-25" onSubmit={handleFormSubmission}>
          <FormInput
            autoFocus
            placeholder="Nombre"
            error={errorMessage}
            value={name}
            required
            onChange={(event) => validateName(event.target.value)}
          />
          <FormButton text="¡Adelante!" />
          {submissionError && (
            <div className="mt-2 text-danger">
              <small>{submissionError}</small>
            </div>
          )}
        </Form>
      </Container>
    </>
  );
};
