import { Form } from "react-bootstrap";
import FormButton from "../Form/FormButton";
import FormInput from "../Form/FormInput";
import FormSelect from "../Form/FormSelect";
import "./CreateGameForm.css";

// Componente principal del formulario
function CreateGameForm({
  handleFormSubmission,
  validateName,
  errorMessage,
  setSelectedPlayers,
  submissionError,
  name,
}) {
  return (
    <Form className="text-center" onSubmit={handleFormSubmission}>
      <FormInput
        placeholder={"Ingrese el nombre de la partida"}
        value={name}
        onChange={(event) => validateName(event.target.value)}
        required
        error={errorMessage}
      />
      <FormSelect required setValue={setSelectedPlayers}>
        <option value={""} disabled>
          Selecciona cantidad de jugadores
        </option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </FormSelect>
      <FormButton text={"Crear partida"} />
      {submissionError && (
        <div className="mt-2 text-danger">
          <small>{submissionError}</small>
        </div>
      )}
    </Form>
  );
}

// Exporta el componente Form para su uso en otras partes de la aplicación.
export default CreateGameForm;
