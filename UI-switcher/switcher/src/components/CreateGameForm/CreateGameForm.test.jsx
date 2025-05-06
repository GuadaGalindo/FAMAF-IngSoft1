import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import CreateGameForm from "./CreateGameForm";
import { MemoryRouter } from "react-router-dom";
import FormSelect from "../Form/FormSelect";
import FormInput from "../Form/FormInput";

// Block to group all Form tests.
describe("Form Component", () => {
  // Before each test the Form component is rendered inside MemoryRouter.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // After each test the mocks are cleaned.
  afterEach(() => {
    vi.clearAllMocks();
  });

  // TESTING FOR THE USER INTERFACE.

  // We verify that the game name input is present.
  it("should show the input to enter the game name", () => {
    render(
      <MemoryRouter>
        <CreateGameForm
          handleFormSubmission={vi.fn()}
          errorMessage={""}
          name={""}
          setSelectedPlayers={vi.fn()}
          submissionError={""}
          validateName={vi.fn()}
        />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText(
      "Ingrese el nombre de la partida"
    );
    expect(input).toBeInTheDocument();
  });

  // We verify that the number of players selection is present.
  it("should show the select to select number of players", () => {
    render(
      <MemoryRouter>
        <CreateGameForm
          handleFormSubmission={vi.fn()}
          errorMessage={""}
          name={""}
          setSelectedPlayers={vi.fn()}
          submissionError={""}
          validateName={vi.fn()}
        />
      </MemoryRouter>
    );
    const select = screen.getByText("Selecciona cantidad de jugadores");
    expect(select).toBeInTheDocument();
  });

  // We verify that the create button is present.
  it('should show the "Create" button', () => {
    render(
      <MemoryRouter>
        <CreateGameForm
          handleFormSubmission={vi.fn()}
          errorMessage={""}
          name={""}
          setSelectedPlayers={vi.fn()}
          submissionError={""}
          validateName={vi.fn()}
        />
      </MemoryRouter>
    );
    const createButton = screen.getByRole("button", { name: "Crear partida" });
    expect(createButton).toBeInTheDocument();
  });

  // API TESTING

  it("should show server error if passed", async () => {
    render(
      <MemoryRouter>
        <CreateGameForm
          handleFormSubmission={vi.fn()}
          errorMessage={""}
          name={""}
          setSelectedPlayers={vi.fn()}
          submissionError={"No es posible crear la partida en este momento"}
          validateName={vi.fn()}
        />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Ingrese el nombre de la partida"
    );
    const select = screen.getByText("Selecciona cantidad de jugadores");

    act(() => {
      fireEvent.change(input, { target: { value: "PartidaValida" } });
      fireEvent.change(select, { target: { value: "2" } });
    });

    const button = screen.getByRole("button", { name: "Crear partida" });
    act(() => {
      fireEvent.click(button);
    });

    const errorMessage = await screen.findByText(
      "No es posible crear la partida en este momento"
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it("should display the label when provided in FormSelect", () => {
    render(
      <MemoryRouter>
        <CreateGameForm
          handleFormSubmission={vi.fn()}
          errorMessage={""}
          name={""}
          setSelectedPlayers={vi.fn()}
          submissionError={""}
          validateName={vi.fn()}
        />
      </MemoryRouter>
    );

    // add the 'label' prop to the FormSelect
    const { getByText } = render(
      <FormSelect label="Número de jugadores" required setValue={vi.fn()}>
        <option value={""} disabled>
          Selecciona cantidad de jugadores
        </option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </FormSelect>
    );

    const labelElement = getByText("Número de jugadores");
    expect(labelElement).toBeInTheDocument(); // verify that the label is displayed
  });

  // verify that the error message is displayed
  it("should display the error message when provided in FormSelect", () => {
    render(
      <MemoryRouter>
        <CreateGameForm
          handleFormSubmission={vi.fn()}
          errorMessage={""}
          name={""}
          setSelectedPlayers={vi.fn()}
          submissionError={""}
          validateName={vi.fn()}
        />
      </MemoryRouter>
    );

    const { getByText } = render(
      <FormSelect
        label="Número de jugadores"
        error="Este campo es obligatorio."
        required
        setValue={vi.fn()}
      >
        <option value={""} disabled>
          Selecciona cantidad de jugadores
        </option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </FormSelect>
    );

    const errorMessage = getByText("Este campo es obligatorio.");
    expect(errorMessage).toBeInTheDocument();
  });

  it("should display the label when provided in FormInput", () => {
    render(
      <FormInput
        label="Nombre de la Partida"
        placeholder="Ingrese el nombre de la partida"
        value=""
        onChange={vi.fn()}
        required
        error=""
      />
    );

    const labelElement = screen.getByText("Nombre de la Partida");
    expect(labelElement).toBeInTheDocument();
  });
});
